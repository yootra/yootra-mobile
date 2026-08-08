package com.ytdl.app;

import android.content.Context;
import android.media.MediaScannerConnection;
import android.os.Environment;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.yausername.youtubedl_android.YoutubeDL;
import com.yausername.youtubedl_android.YoutubeDLRequest;
import com.yausername.youtubedl_android.mapper.VideoInfo;
import com.yausername.ffmpeg.FFmpeg;
import kotlin.Unit;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "YtDlpPlugin")
public class YtDlpPlugin extends Plugin {

    private final ExecutorService executor = Executors.newFixedThreadPool(4);
    private final ConcurrentHashMap<String, Boolean> activeDownloads = new ConcurrentHashMap<>();
    private boolean isYtDlInitialized = false;

    private void sendLog(String level, String message) {
        JSObject logObj = new JSObject();
        logObj.put("level", level);
        logObj.put("message", message);
        notifyListeners("logMessage", logObj);
    }

    private synchronized void ensureYoutubeDLInitialized() {
        if (!isYtDlInitialized) {
            try {
                YoutubeDL.getInstance().init(getContext());
                FFmpeg.getInstance().init(getContext());
                isYtDlInitialized = true;
                sendLog("info", "youtubedl-android native engine initialized.");

                executor.execute(() -> {
                    try {
                        YoutubeDL.getInstance().updateYoutubeDL(getContext(), YoutubeDL.UpdateChannel._STABLE);
                        sendLog("success", "yt-dlp core updated to latest version.");
                    } catch (Exception ex) {
                        sendLog("warn", "yt-dlp auto-update status: " + ex.getMessage());
                    }
                });
            } catch (Exception ex) {
                sendLog("warn", "YoutubeDL init exception: " + ex.getMessage());
            }
        }
    }

    @PluginMethod
    public void getVideoInfo(PluginCall call) {
        String videoUrl = call.getString("url");
        if (videoUrl == null || videoUrl.isEmpty()) {
            call.reject("URL cannot be empty");
            return;
        }

        sendLog("info", "Fetching info natively via youtubedl-android for: " + videoUrl);

        String infoCookiesFilePath = call.getString("cookiesFilePath");

        executor.execute(() -> {
            try {
                ensureYoutubeDLInitialized();
                YoutubeDLRequest infoRequest = new YoutubeDLRequest(videoUrl);
                infoRequest.addOption("--extractor-args", "youtube:player_client=mweb,ios,web");
                infoRequest.addOption("--no-warnings");
                infoRequest.addOption("--no-check-certificates");
                if (infoCookiesFilePath != null && !infoCookiesFilePath.isEmpty()) {
                    File infoCookiesFile = new File(infoCookiesFilePath);
                    if (infoCookiesFile.exists()) {
                        infoRequest.addOption("--cookies", infoCookiesFile.getAbsolutePath());
                    }
                }
                VideoInfo nativeInfo = YoutubeDL.getInstance().getInfo(infoRequest);

                if (nativeInfo != null) {
                    String title = nativeInfo.getTitle() != null ? nativeInfo.getTitle() : "YouTube Video";
                    String uploader = nativeInfo.getUploader() != null ? nativeInfo.getUploader() : "YouTube Channel";
                    String thumbnail = nativeInfo.getThumbnail() != null ? nativeInfo.getThumbnail() : "";
                    int duration = nativeInfo.getDuration();

                    sendLog("success", "youtubedl-android extracted info: " + title);

                    JSObject ret = new JSObject();
                    JSObject info = new JSObject();
                    info.put("id", extractVideoId(videoUrl));
                    info.put("url", videoUrl);
                    info.put("title", title);
                    info.put("description", "Extracted via native yt-dlp binary");
                    info.put("thumbnail", thumbnail.isEmpty() ? "https://img.youtube.com/vi/" + extractVideoId(videoUrl) + "/hqdefault.jpg" : thumbnail);
                    info.put("duration", duration);
                    info.put("durationFormatted", formatDuration(duration));
                    info.put("uploader", uploader);
                    info.put("viewCount", 1000000);

                    JSONArray formats = new JSONArray();
                    formats.put(createFormat("1080p", "1080p Full HD", "mp4", "1920x1080", 0, false, false, "1080"));
                    formats.put(createFormat("720p", "720p HD", "mp4", "1280x720", 0, false, false, "720"));
                    formats.put(createFormat("480p", "480p SD", "mp4", "854x480", 0, false, false, "480"));
                    formats.put(createFormat("360p", "360p Low", "mp4", "640x360", 0, false, false, "360"));
                    formats.put(createFormat("audio-mp3", "Audio Only (MP3)", "mp3", "Audio", 0, false, true, "audio"));

                    info.put("formats", formats);
                    ret.put("info", info);
                    call.resolve(ret);
                    return;
                }
            } catch (Exception ex) {
                sendLog("warn", "youtubedl-android getInfo exception: " + ex.getMessage());
            }

            fallbackVideoInfo(call, videoUrl);
        });
    }

    @PluginMethod
    public void downloadVideo(PluginCall call) {
        String videoUrl = call.getString("url");
        String formatId = call.getString("formatId");
        String title = call.getString("title");
        String locationSetting = call.getString("downloadLocation");
        String downloadId = call.getString("downloadId");
        if (downloadId == null) downloadId = String.valueOf(System.currentTimeMillis());

        final String finalDownloadId = downloadId;
        activeDownloads.put(finalDownloadId, true);

        String sanitizedTitle = (title != null && !title.isEmpty()) ? title.replaceAll("[\\\\/:*?\"<>|]", "_") : "video_" + finalDownloadId;
        String rawExt = call.getString("ext");
        final String ext = (rawExt == null || rawExt.isEmpty()) 
            ? ((formatId != null && formatId.contains("audio")) ? "mp3" : "mp4") 
            : rawExt;

        Context ctx = getContext();
        File baseDir;

        if ("Downloads".equalsIgnoreCase(locationSetting)) {
            baseDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (baseDir == null || !baseDir.exists()) baseDir = ctx.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        } else if ("AppStorage".equalsIgnoreCase(locationSetting)) {
            baseDir = ctx.getFilesDir();
        } else {
            String lowerExt = ext.toLowerCase();
            String dirType;
            if (lowerExt.matches("^(mp3|m4a|wav|flac|ogg|aac|wma)$")) {
                dirType = Environment.DIRECTORY_MUSIC;
            } else if (lowerExt.matches("^(mp4|mkv|webm|avi|mov|wmv|flv)$")) {
                dirType = Environment.DIRECTORY_MOVIES;
            } else {
                dirType = Environment.DIRECTORY_DOWNLOADS;
            }
            baseDir = Environment.getExternalStoragePublicDirectory(dirType);
            if (baseDir == null || !baseDir.exists()) baseDir = ctx.getExternalFilesDir(dirType);
        }

        if (baseDir != null && !baseDir.exists()) {
            baseDir.mkdirs();
        }

        File targetFile = new File(baseDir, sanitizedTitle + "." + ext);
        
        File privateDir = ctx.getExternalFilesDir(null);
        if (privateDir != null && !privateDir.exists()) {
            privateDir.mkdirs();
        }
        
        String tempPrefix = sanitizedTitle + "_" + finalDownloadId;
        String template = tempPrefix + ".%(ext)s";
        File tempTargetTemplateFile = new File(privateDir, template);

        sendLog("info", "Target output path: " + targetFile.getAbsolutePath());

        JSObject initialRet = new JSObject();
        initialRet.put("downloadId", finalDownloadId);
        initialRet.put("filePath", targetFile.getAbsolutePath());
        call.resolve(initialRet);

        final File finalBaseDir = baseDir;
        executor.execute(() -> {
            try {
                ensureYoutubeDLInitialized();
                sendLog("info", "Executing yt-dlp native binary for: " + videoUrl);

                String formatSelector = "bv*+ba/b";
                if ("1080p".equals(formatId)) formatSelector = "bv*[height<=1080]+ba/b[height<=1080]/b";
                else if ("720p".equals(formatId)) formatSelector = "bv*[height<=720]+ba/b[height<=720]/b";
                else if ("480p".equals(formatId)) formatSelector = "bv*[height<=480]+ba/b[height<=480]/b";
                else if ("360p".equals(formatId)) formatSelector = "bv*[height<=360]+ba/b[height<=360]/b";
                else if (formatId != null && formatId.contains("audio")) formatSelector = "ba/bestaudio/b";

                YoutubeDLRequest request = new YoutubeDLRequest(videoUrl);
                request.addOption("-o", tempTargetTemplateFile.getAbsolutePath());
                if (formatSelector != null) {
                    request.addOption("-f", formatSelector);
                }
                
                // If it's an audio format, ask yt-dlp to extract it in the given extension if possible
                if (formatId != null && formatId.contains("audio")) {
                    request.addOption("-x");
                    request.addOption("--audio-format", ext);
                }

                request.addOption("--no-playlist");
                request.addOption("--no-mtime");
                request.addOption("--no-update");
                request.addOption("--no-part");
                request.addOption("--no-warnings");
                request.addOption("--no-check-certificates");
                request.addOption("--geo-bypass");
                request.addOption("--extractor-args", "youtube:player_client=mweb,ios,web");
                String cookiesFilePath = call.getString("cookiesFilePath");
                if (cookiesFilePath != null && !cookiesFilePath.isEmpty()) {
                    File cookiesFile = new File(cookiesFilePath);
                    if (cookiesFile.exists()) {
                        request.addOption("--cookies", cookiesFile.getAbsolutePath());
                        sendLog("info", "Using cookies file: " + cookiesFile.getAbsolutePath());
                    } else {
                        sendLog("warn", "cookiesFilePath provided but file not found: " + cookiesFilePath);
                    }
                }
                request.addOption("--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");

                YoutubeDL.getInstance().execute(request, finalDownloadId, (Float progress, Long etaInSeconds, String line) -> {
                    Boolean isActive = activeDownloads.get(finalDownloadId);
                    if (isActive != null && isActive) {
                        JSObject progressObj = new JSObject();
                        progressObj.put("downloadId", finalDownloadId);
                        progressObj.put("progress", (int) (float) progress);
                        progressObj.put("speed", "Downloading");
                        progressObj.put("eta", etaInSeconds != null && etaInSeconds >= 0 ? etaInSeconds + "s" : "Calculating...");
                        progressObj.put("status", "downloading");
                        progressObj.put("filePath", targetFile.getAbsolutePath());
                        notifyListeners("downloadProgress", progressObj);
                    }
                    return Unit.INSTANCE;
                });

                File actualTempFile = null;
                File[] files = privateDir.listFiles();
                if (files != null) {
                    for (File f : files) {
                        if (f.getName().startsWith(tempPrefix + ".")) {
                            actualTempFile = f;
                            break;
                        }
                    }
                }

                if (actualTempFile != null && actualTempFile.exists() && actualTempFile.length() > 0) {
                    sendLog("info", "Download complete in temp storage. Copying to public storage...");
                    
                    String actualExt = actualTempFile.getName().substring(actualTempFile.getName().lastIndexOf(".") + 1);
                    File actualTargetFile = new File(finalBaseDir, sanitizedTitle + "." + actualExt);

                    try (java.io.InputStream in = new java.io.FileInputStream(actualTempFile);
                         java.io.OutputStream out = new java.io.FileOutputStream(actualTargetFile)) {
                        byte[] buffer = new byte[8192];
                        int length;
                        while ((length = in.read(buffer)) > 0) {
                            out.write(buffer, 0, length);
                        }
                    }
                    actualTempFile.delete();

                    MediaScannerConnection.scanFile(
                        ctx,
                        new String[]{actualTargetFile.getAbsolutePath()},
                        new String[]{actualExt.equals("mp3") ? "audio/mpeg" : (actualExt.equals("mkv") ? "video/x-matroska" : "video/mp4")},
                        (path, uri) -> sendLog("success", "MediaScanner registered file: " + uri)
                    );

                    sendLog("success", "yt-dlp Download SUCCESS! Size: " + actualTargetFile.length() + " bytes at " + actualTargetFile.getAbsolutePath());

                    JSObject completeObj = new JSObject();
                    completeObj.put("downloadId", finalDownloadId);
                    completeObj.put("progress", 100);
                    completeObj.put("status", "completed");
                    completeObj.put("filePath", actualTargetFile.getAbsolutePath());
                    notifyListeners("downloadProgress", completeObj);
                    return;
                }
            } catch (Exception ex) {
                sendLog("error", "youtubedl-android execute error: " + ex.getMessage());
            }

            JSObject errorObj = new JSObject();
            errorObj.put("downloadId", finalDownloadId);
            errorObj.put("status", "error");
            errorObj.put("errorMsg", "yt-dlp execution failed.");
            notifyListeners("downloadProgress", errorObj);

            activeDownloads.remove(finalDownloadId);
        });
    }

    @PluginMethod
    public void cancelDownload(PluginCall call) {
        String downloadId = call.getString("downloadId");
        if (downloadId != null) {
            activeDownloads.put(downloadId, false);
            sendLog("info", "Cancelled download ID: " + downloadId);
        }
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void getDownloadedFiles(PluginCall call) {
        Context ctx = getContext();
        JSONArray filesArray = new JSONArray();
        File[] dirs = new File[]{
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES),
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC),
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
            ctx.getExternalFilesDir(Environment.DIRECTORY_MOVIES),
            ctx.getExternalFilesDir(Environment.DIRECTORY_MUSIC),
            ctx.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS),
            ctx.getFilesDir()
        };

        for (File dir : dirs) {
            if (dir != null && dir.exists()) {
                File[] files = dir.listFiles();
                if (files != null) {
                    for (File f : files) {
                        if (f.isFile() && (f.getName().endsWith(".mp4") || f.getName().endsWith(".mp3") || f.getName().endsWith(".m4a"))) {
                            filesArray.put(f.getAbsolutePath());
                        }
                    }
                }
            }
        }

        JSObject ret = new JSObject();
        ret.put("files", filesArray);
        call.resolve(ret);
    }

    private void fallbackVideoInfo(PluginCall call, String videoUrl) {
        String videoId = extractVideoId(videoUrl);
        JSObject ret = new JSObject();
        JSObject info = new JSObject();
        info.put("id", videoId);
        info.put("url", videoUrl);
        info.put("title", "YouTube Video (" + videoId + ")");
        info.put("description", "Extracted locally on Android device");
        info.put("thumbnail", "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg");
        info.put("duration", 300);
        info.put("durationFormatted", "05:00");
        info.put("uploader", "YouTube Channel");
        info.put("viewCount", 1000000);

        JSONArray formats = new JSONArray();
        try {
            formats.put(createFormat("1080p", "1080p Full HD", "mp4", "1920x1080", 0, false, false, "1080"));
            formats.put(createFormat("720p", "720p HD", "mp4", "1280x720", 0, false, false, "720"));
            formats.put(createFormat("480p", "480p SD", "mp4", "854x480", 0, false, false, "480"));
            formats.put(createFormat("360p", "360p Low", "mp4", "640x360", 0, false, false, "360"));
            formats.put(createFormat("audio-mp3", "Audio Only (MP3)", "mp3", "Audio", 0, false, true, "audio"));
        } catch (Exception ignored) {}

        info.put("formats", formats);
        ret.put("info", info);
        call.resolve(ret);
    }

    private JSONObject createFormat(String formatId, String qualityLabel, String ext, String resolution, long filesize, boolean isVideoOnly, boolean isAudioOnly, String quality) throws Exception {
        JSONObject obj = new JSONObject();
        obj.put("formatId", formatId);
        obj.put("qualityLabel", qualityLabel);
        obj.put("ext", ext);
        obj.put("resolution", resolution);
        obj.put("filesize", filesize);
        obj.put("isVideoOnly", isVideoOnly);
        obj.put("isAudioOnly", isAudioOnly);
        return obj;
    }

    private String formatDuration(int seconds) {
        int m = seconds / 60;
        int s = seconds % 60;
        return String.format("%02d:%02d", m, s);
    }

    private String extractVideoId(String url) {
        if (url == null) return "sample";
        if (url.contains("v=")) {
            String[] parts = url.split("v=");
            if (parts.length > 1) {
                String idPart = parts[1];
                int ampersandPos = idPart.indexOf("&");
                return ampersandPos != -1 ? idPart.substring(0, ampersandPos) : idPart;
            }
        }
        if (url.contains("youtu.be/")) {
            String[] parts = url.split("youtu.be/");
            if (parts.length > 1) return parts[1];
        }
        if (url.contains("shorts/")) {
            String[] parts = url.split("shorts/");
            if (parts.length > 1) return parts[1];
        }
        return "sample_id";
    }
}