package com.basssg.thaidailynews;
import android.appwidget.AppWidgetManager;
import android.content.*;
import android.widget.*;
import org.json.JSONObject;
import java.util.*;

/** Android 8–11 collection adapter; Android 12+ receives a bounded collection directly. */
public class WidgetCollectionService extends RemoteViewsService {
    @Override public RemoteViewsFactory onGetViewFactory(Intent intent){return new Factory(getApplicationContext(),intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID));}
    static final class Factory implements RemoteViewsFactory {
        private final Context context;private final int id;private List<JSONObject> items=Collections.emptyList();
        Factory(Context context,int id){this.context=context;this.id=id;}
        @Override public void onCreate(){onDataSetChanged();}
        @Override public void onDataSetChanged(){items=NewsWidgetProvider.selected(context,id);}
        @Override public void onDestroy(){items=Collections.emptyList();}
        @Override public int getCount(){return items.size();}
        @Override public RemoteViews getViewAt(int position){return position<0||position>=items.size()?null:NewsWidgetProvider.story(context,id,items.get(position),"large",250,true);}
        @Override public RemoteViews getLoadingView(){return null;}
        @Override public int getViewTypeCount(){return 2;}
        @Override public long getItemId(int position){return position<0||position>=items.size()?0:NewsWidgetProvider.stableId(items.get(position));}
        @Override public boolean hasStableIds(){return true;}
    }
}
