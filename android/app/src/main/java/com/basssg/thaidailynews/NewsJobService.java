package com.basssg.thaidailynews;
import android.app.job.*;
import android.content.*;
public class NewsJobService extends JobService {
    public static void schedule(Context c){JobScheduler scheduler=c.getSystemService(JobScheduler.class);if(scheduler.getPendingJob(2100)==null)scheduler.schedule(new JobInfo.Builder(2100,new ComponentName(c,NewsJobService.class)).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setPeriodic(15*60_000L).setPersisted(true).setBackoffCriteria(60_000L,JobInfo.BACKOFF_POLICY_EXPONENTIAL).build());}
    public static void refreshSoon(Context c){c.getSystemService(JobScheduler.class).schedule(new JobInfo.Builder(2101,new ComponentName(c,NewsJobService.class)).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setMinimumLatency(0).setOverrideDeadline(1000).build());}
    @Override public boolean onStartJob(JobParameters params){NewsRepository.IO.execute(()->{boolean retry=false;try{NewsRepository.refresh(this,true);}catch(Exception e){retry=true;}jobFinished(params,retry);});return true;}
    @Override public boolean onStopJob(JobParameters params){return true;}
}
