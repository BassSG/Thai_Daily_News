package com.basssg.thaidailynews;
import android.app.job.*;
import android.content.*;
import java.util.concurrent.atomic.AtomicBoolean;
public class NewsJobService extends JobService {
    private static final AtomicBoolean photoRunning=new AtomicBoolean(),photoPending=new AtomicBoolean();
    public static void schedule(Context c){JobScheduler scheduler=c.getSystemService(JobScheduler.class);if(scheduler.getPendingJob(2100)==null)scheduler.schedule(new JobInfo.Builder(2100,new ComponentName(c,NewsJobService.class)).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setPeriodic(15*60_000L).setPersisted(true).setBackoffCriteria(60_000L,JobInfo.BACKOFF_POLICY_EXPONENTIAL).build());}
    public static void refreshSoon(Context c){JobScheduler scheduler=c.getSystemService(JobScheduler.class);if(scheduler.getPendingJob(2101)==null)scheduler.schedule(new JobInfo.Builder(2101,new ComponentName(c,NewsJobService.class)).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setMinimumLatency(0).setOverrideDeadline(1000).build());}
    private static void schedulePhotos(Context c){c.getSystemService(JobScheduler.class).schedule(new JobInfo.Builder(2102,new ComponentName(c,NewsJobService.class)).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setMinimumLatency(0).setOverrideDeadline(1000).build());}
    public static void refreshWidgetPhotos(Context c){photoPending.set(true);if(!photoRunning.get()&&c.getSystemService(JobScheduler.class).getPendingJob(2102)==null)schedulePhotos(c);}
    @Override public boolean onStartJob(JobParameters params){
        boolean photos=params.getJobId()==2102;
        if(photos&&!photoRunning.compareAndSet(false,true)){photoPending.set(true);return false;}
        (photos?NewsRepository.IMAGE_IO:NewsRepository.IO).execute(()->{boolean retry=false;try{if(photos){photoPending.set(false);NewsWidgetProvider.refreshPhotos(this);if(photoPending.getAndSet(false))NewsWidgetProvider.refreshPhotos(this);}else NewsRepository.refresh(this,true);}catch(Exception e){retry=true;}finally{if(photos)photoRunning.set(false);jobFinished(params,retry);if(photos&&photoPending.get())schedulePhotos(getApplicationContext());}});return true;
    }
    @Override public boolean onStopJob(JobParameters params){return true;}
}
