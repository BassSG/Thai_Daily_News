package com.basssg.thaidailynews;

import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import org.json.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import javax.net.ssl.HttpsURLConnection;

public final class NewsRepository {
    public static final String API="https://script.google.com/macros/s/AKfycbwatsqO1HW7xmIbfJgm6P-4otzfNbvGeVdcVjflwHZxzbDM34o4ul_Fe3Wfy-NuKVlaoQ/exec";
    public static final String CHANNEL="thai_daily_news";
    public static final ExecutorService IO=Executors.newSingleThreadExecutor();
    private NewsRepository(){}
    public static android.content.SharedPreferences prefs(Context c){return c.getSharedPreferences("thai_daily",Context.MODE_PRIVATE);}
    public static JSONObject settings(Context c){try{return new JSONObject(prefs(c).getString("settings","{}"));}catch(Exception e){return new JSONObject();}}
    public static JSONObject cached(Context c){try{return new JSONObject(new String(java.nio.file.Files.readAllBytes(new File(c.getFilesDir(),"news.json").toPath()),StandardCharsets.UTF_8));}catch(Exception e){return new JSONObject();}}
    public static JSONArray bookmarks(Context c){try{return new JSONArray(prefs(c).getString("bookmarks","[]"));}catch(Exception e){return new JSONArray();}}
    static boolean trustedApiHost(String value){try{URI uri=URI.create(value);String host=uri.getHost();return "https".equals(uri.getScheme())&&host!=null&&(host.equals("script.google.com")||host.endsWith(".googleusercontent.com"));}catch(Exception e){return false;}}
    public static JSONObject request(String url,JSONObject payload)throws Exception{
        String method=payload==null?"GET":"POST";
        for(int redirects=0;redirects<6;redirects++){
            if(!trustedApiHost(url))throw new IOException("Untrusted redirect");
            HttpsURLConnection connection=(HttpsURLConnection)new URL(url).openConnection();
            connection.setConnectTimeout(15000);connection.setReadTimeout(30000);connection.setInstanceFollowRedirects(false);connection.setRequestMethod(method);connection.setRequestProperty("Accept","application/json");
            try{
                if("POST".equals(method)){connection.setDoOutput(true);connection.setRequestProperty("Content-Type","text/plain; charset=utf-8");try(OutputStream out=connection.getOutputStream()){out.write(payload.toString().getBytes(StandardCharsets.UTF_8));}}
                int code=connection.getResponseCode();
                if(code==301||code==302||code==303||code==307||code==308){String next=connection.getHeaderField("Location");if(next==null)throw new IOException("Missing redirect");url=new URL(new URL(url),next).toString();if(code==301||code==302||code==303)method="GET";continue;}
                if(code!=200)throw new IOException("HTTP "+code);
                try(InputStream in=connection.getInputStream();ByteArrayOutputStream bytes=new ByteArrayOutputStream()){
                    byte[] buffer=new byte[8192];int count;while((count=in.read(buffer))!=-1){if(bytes.size()+count>2_000_000)throw new IOException("Response too large");bytes.write(buffer,0,count);}return new JSONObject(bytes.toString(StandardCharsets.UTF_8.name()));
                }
            }finally{connection.disconnect();}
        }throw new IOException("Too many redirects");
    }
    public static JSONObject refresh(Context c,boolean notify)throws Exception{
        JSONObject old=cached(c),response=request(API+"?action=snapshot",null);
        if(!response.optBoolean("ok")||response.optJSONObject("snapshot")==null)throw new IOException("News unavailable");
        JSONObject snapshot=response.getJSONObject("snapshot");
        if(snapshot.optJSONArray("items")==null)throw new IOException("Invalid snapshot");
        File temp=new File(c.getFilesDir(),"news-next.json"),dest=new File(c.getFilesDir(),"news.json");
        try(FileOutputStream out=new FileOutputStream(temp)){out.write(snapshot.toString().getBytes(StandardCharsets.UTF_8));out.getFD().sync();}
        java.nio.file.Files.move(temp.toPath(),dest.toPath(),java.nio.file.StandardCopyOption.REPLACE_EXISTING,java.nio.file.StandardCopyOption.ATOMIC_MOVE);
        prefs(c).edit().putLong("last_success",System.currentTimeMillis()).apply();
        if(notify)notifyNew(c,old,snapshot);
        NewsWidgetProvider.updateAll(c);return response;
    }
    static long timestamp(String s){try{return Instant.parse(s).toEpochMilli();}catch(Exception e){return 0;}}
    public static boolean matches(JSONObject article,JSONObject setting){
        JSONArray cats=setting.optJSONArray("categories");boolean accepted=cats==null||cats.length()==0;
        if(cats!=null)for(int i=0;i<cats.length();i++)if(cats.optString(i).equals(article.optString("category_id")))accepted=true;
        return accepted&&(!setting.optBoolean("importantOnly")||article.optDouble("score")>=13);
    }
    public static void createChannel(Context c){NotificationManager nm=c.getSystemService(NotificationManager.class);NotificationChannel channel=new NotificationChannel(CHANNEL,"ข่าวใหม่จาก Thai Daily",NotificationManager.IMPORTANCE_DEFAULT);channel.setDescription("ข่าวใหม่ในหมวดที่คุณเลือก ปรับเสียงและการแสดงผลได้ที่นี่");nm.createNotificationChannel(channel);}
    public static boolean permission(Context c){return Build.VERSION.SDK_INT<33||c.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)==PackageManager.PERMISSION_GRANTED;}
    public static void notifyNew(Context c,JSONObject old,JSONObject snapshot){
        JSONObject setting=settings(c);if(!setting.optBoolean("enabled")||!permission(c))return;
        int hour=LocalTime.now().getHour();if(setting.optBoolean("quietHours",true)&&(hour>=22||hour<7))return;
        long now=System.currentTimeMillis();if(now-prefs(c).getLong("last_notification",0)<30*60_000L)return;
        JSONArray previous=old.optJSONArray("items"),items=snapshot.optJSONArray("items");if(previous==null||previous.length()==0||items==null)return;
        Set<String> ids=new HashSet<>();for(int i=0;i<previous.length();i++)ids.add(previous.optJSONObject(i).optString("id"));
        ArrayList<JSONObject> news=new ArrayList<>();for(int i=0;i<items.length();i++){JSONObject item=items.optJSONObject(i);if(item!=null&&!ids.contains(item.optString("id"))&&now-timestamp(item.optString("published_at"))<2*3600_000L&&matches(item,setting))news.add(item);}
        if(news.isEmpty())return;createChannel(c);
        JSONObject first=news.get(0);Intent intent=new Intent(c,MainActivity.class).putExtra("article",first.optString("id")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent open=PendingIntent.getActivity(c,101,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        Notification.InboxStyle style=new Notification.InboxStyle();for(int i=0;i<Math.min(3,news.size());i++)style.addLine(news.get(i).optString("title"));
        Notification notification=new Notification.Builder(c,CHANNEL).setSmallIcon(R.drawable.ic_notification).setColor(Color.rgb(214,183,117)).setContentTitle("ข่าวใหม่ "+news.size()+" เรื่อง · Thai Daily").setContentText(first.optString("title")).setStyle(style).setContentIntent(open).setAutoCancel(true).setCategory(Notification.CATEGORY_RECOMMENDATION).setVisibility(Notification.VISIBILITY_PUBLIC).setOnlyAlertOnce(true).build();
        c.getSystemService(NotificationManager.class).notify(200,notification);prefs(c).edit().putLong("last_notification",now).apply();
    }
    public static void testNotification(Context c){if(!permission(c))return;createChannel(c);PendingIntent open=PendingIntent.getActivity(c,102,new Intent(c,MainActivity.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);Notification n=new Notification.Builder(c,CHANNEL).setSmallIcon(R.drawable.ic_notification).setColor(Color.rgb(214,183,117)).setContentTitle("Thai Daily News").setContentText("พร้อมแล้ว ข่าวสำคัญจะมาหาคุณในจังหวะที่เหมาะสม").setStyle(new Notification.BigTextStyle().bigText("พร้อมแล้ว ข่าวสำคัญจะมาหาคุณในจังหวะที่เหมาะสม")).setContentIntent(open).setAutoCancel(true).build();c.getSystemService(NotificationManager.class).notify(201,n);}
}
