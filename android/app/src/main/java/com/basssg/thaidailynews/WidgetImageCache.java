package com.basssg.thaidailynews;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.os.Looper;
import android.os.SystemClock;
import org.json.JSONObject;
import java.io.*;
import java.net.*;
import java.security.MessageDigest;
import java.util.*;
import javax.net.ssl.HttpsURLConnection;

/** Bounded publisher thumbnails. Rendering only reads disk; downloads use the image executor. */
final class WidgetImageCache {
    private static final int MAX_DOWNLOAD=4_000_000, WIDTH=320, HEIGHT=200;
    private static final long MAX_DISK=10_000_000L, RETRY_MS=30*60_000L;
    private static final Map<String,Long> failures=Collections.synchronizedMap(new LinkedHashMap<String,Long>() {
        @Override protected boolean removeEldestEntry(Map.Entry<String,Long> entry){return size()>128;}
    });
    private WidgetImageCache(){}

    static boolean safeUrl(String value){
        try{
            URI uri=new URI(value);String host=uri.getHost();
            if(!"https".equalsIgnoreCase(uri.getScheme())||host==null||uri.getUserInfo()!=null||(uri.getPort()!=-1&&uri.getPort()!=443))return false;
            host=host.toLowerCase(Locale.ROOT);
            return host.contains(".")&&!host.endsWith(".")&&!host.endsWith(".local")&&!host.endsWith(".localhost")&&!host.matches("[0-9.]+")&&!host.contains(":");
        }catch(Exception e){return false;}
    }
    private static File file(Context c,String url)throws Exception{
        byte[] hash=MessageDigest.getInstance("SHA-256").digest(url.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        StringBuilder key=new StringBuilder();for(byte b:hash)key.append(String.format(Locale.ROOT,"%02x",b&255));
        return new File(new File(c.getCacheDir(),"widget-photos"),key+".jpg");
    }
    static Bitmap get(Context c,String url,boolean cover){
        if(!safeUrl(url))return null;
        try{
            File image=file(c,url);if(!image.isFile()||image.length()>MAX_DOWNLOAD)return null;
            BitmapFactory.Options options=new BitmapFactory.Options();options.inSampleSize=cover?1:2;options.inScaled=false;
            Bitmap bitmap=BitmapFactory.decodeFile(image.getPath(),options);
            if(bitmap!=null&&(bitmap.getWidth()>WIDTH||bitmap.getHeight()>HEIGHT)){bitmap.recycle();return null;}
            return bitmap;
        }catch(Exception e){return null;}
    }
    static void preload(Context c,List<JSONObject> articles){
        if(Looper.myLooper()==Looper.getMainLooper())throw new IllegalStateException("Widget photos must download off the UI thread");
        long deadline=SystemClock.elapsedRealtime()+25_000L;Set<String> seen=new HashSet<>();int attempts=0;
        for(JSONObject article:articles){
            String url=article.optString("image_url");if(!safeUrl(url)||!seen.add(url))continue;
            try{
                File image=file(c,url);if(image.isFile()&&image.length()>0)continue;
                Long failed=failures.get(url);if(failed!=null&&System.currentTimeMillis()-failed<RETRY_MS)continue;
                if(attempts>=20||SystemClock.elapsedRealtime()>=deadline)break;attempts++;
                byte[] bytes=download(url,deadline);
                BitmapFactory.Options bounds=new BitmapFactory.Options();bounds.inJustDecodeBounds=true;BitmapFactory.decodeByteArray(bytes,0,bytes.length,bounds);
                if(bounds.outWidth<=0||bounds.outHeight<=0||bounds.outWidth>32768||bounds.outHeight>32768||(long)bounds.outWidth*bounds.outHeight>80_000_000L)throw new IOException("Unsupported image dimensions");
                BitmapFactory.Options options=new BitmapFactory.Options();options.inScaled=false;
                int sample=1;while(bounds.outWidth/sample>WIDTH*2||bounds.outHeight/sample>HEIGHT*2)sample*=2;options.inSampleSize=sample;
                Bitmap decoded=BitmapFactory.decodeByteArray(bytes,0,bytes.length,options);if(decoded==null)throw new IOException("Unsupported image format");
                int cropWidth=Math.max(1,Math.min(decoded.getWidth(),Math.round(decoded.getHeight()*WIDTH/(float)HEIGHT)));
                int cropHeight=Math.max(1,Math.min(decoded.getHeight(),Math.round(decoded.getWidth()*HEIGHT/(float)WIDTH)));
                int left=(decoded.getWidth()-cropWidth)/2,top=(decoded.getHeight()-cropHeight)/2;
                Bitmap thumbnail=Bitmap.createBitmap(WIDTH,HEIGHT,Bitmap.Config.ARGB_8888);
                new Canvas(thumbnail).drawBitmap(decoded,new Rect(left,top,left+cropWidth,top+cropHeight),new Rect(0,0,WIDTH,HEIGHT),new Paint(Paint.FILTER_BITMAP_FLAG));
                image.getParentFile().mkdirs();File temp=new File(image.getPath()+".tmp");
                try(FileOutputStream out=new FileOutputStream(temp)){if(!thumbnail.compress(Bitmap.CompressFormat.JPEG,83,out))throw new IOException("Thumbnail encoding failed");}
                finally{thumbnail.recycle();decoded.recycle();}
                java.nio.file.Files.move(temp.toPath(),image.toPath(),java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                failures.remove(url);
            }catch(Exception e){failures.put(url,System.currentTimeMillis());}
        }
        prune(c);
    }
    static Bitmap collectionImage(Context c,String url){
        Bitmap image=get(c,url,false);if(image==null)return null;
        Bitmap small=Bitmap.createScaledBitmap(image,128,80,true);if(small!=image)image.recycle();return small;
    }
    private static byte[] download(String url,long deadline)throws Exception{
        for(int redirects=0;redirects<5;redirects++){
            if(!safeUrl(url)||SystemClock.elapsedRealtime()>=deadline)throw new IOException("Image unavailable");
            URL address=new URL(url);
            for(InetAddress ip:InetAddress.getAllByName(address.getHost())){
                byte[] raw=ip.getAddress();
                if(ip.isAnyLocalAddress()||ip.isLoopbackAddress()||ip.isLinkLocalAddress()||ip.isSiteLocalAddress()||ip.isMulticastAddress()||(raw.length==16&&(raw[0]&0xfe)==0xfc))throw new IOException("Private image address");
            }
            HttpsURLConnection connection=(HttpsURLConnection)address.openConnection();
            int timeout=(int)Math.max(1,Math.min(4000,deadline-SystemClock.elapsedRealtime()));
            connection.setConnectTimeout(timeout);connection.setReadTimeout(timeout);connection.setInstanceFollowRedirects(false);
            connection.setRequestProperty("Accept","image/*");connection.setRequestProperty("User-Agent","ThaiDailyNews/2.2 (Android widget)");
            try{
                int status=connection.getResponseCode();
                if(status==301||status==302||status==303||status==307||status==308){String location=connection.getHeaderField("Location");if(location==null)throw new IOException("Missing image redirect");url=new URL(address,location).toString();continue;}
                String type=connection.getContentType();
                if(status!=200||connection.getContentLengthLong()>MAX_DOWNLOAD||(type!=null&&!type.startsWith("image/")&&!type.startsWith("application/octet-stream")))throw new IOException("Image response rejected");
                try(InputStream in=connection.getInputStream();ByteArrayOutputStream bytes=new ByteArrayOutputStream()){
                    byte[] buffer=new byte[8192];int count;
                    while((count=in.read(buffer))!=-1){if(bytes.size()+count>MAX_DOWNLOAD||SystemClock.elapsedRealtime()>=deadline)throw new IOException("Image download limit");bytes.write(buffer,0,count);}return bytes.toByteArray();
                }
            }finally{connection.disconnect();}
        }
        throw new IOException("Too many image redirects");
    }
    private static void prune(Context c){
        File[] files=new File(c.getCacheDir(),"widget-photos").listFiles();if(files==null)return;
        Arrays.sort(files,Comparator.comparingLong(File::lastModified).reversed());long size=0;int count=0;
        for(File image:files){size+=image.length();count++;if(size>MAX_DISK||count>96||image.getName().endsWith(".tmp"))image.delete();}
    }
}
