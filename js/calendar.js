

(function($){
'user strict'

    /*每月的第一天 调用: Date.firstDay(2018,8); */ 
    Date.firstDay=function(year,month){
        return new Date(year,month-1,1);
    };
    /*日期格式化 调用: new Date().format("yyyy/MM/dd"); */
    Date.prototype.format=function(format){
        var o = {
            "M+" : this.getMonth()+1, //month
            "d+" : this.getDate(),    //day
            "h+" : this.getHours(),   //hour
            "m+" : this.getMinutes(), //minute
            "s+" : this.getSeconds(), //second
            "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
            "S" : this.getMilliseconds() //millisecond
            }
            if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
            (this.getFullYear()+"").substr(4 - RegExp.$1.length));
            for(var k in o)if(new RegExp("("+ k +")").test(format))
            format = format.replace(RegExp.$1,
            RegExp.$1.length==1 ? o[k] :
            ("00"+ o[k]).substr((""+ o[k]).length));
            return format;
    };

    $.fn.calendar=function(options){
        
        this.each(function(){
            var $this=$(this);
            var data= $this.data("calendar");
            if(!data){
                $this.data("calendar",new Calendar($this,options));
            }
        });

    };

    $.fn.calendar.defaults={
        view:"date", //视图：date , month
        width:280,
        height:280,
        startWeek:0, //从周日开始 
        weekName:['日','一','二','三','四','五','六'],
        date:new Date(),    //默认日期
        format:"yyyy/MM/dd",
        data:null,
        dataFormat:function(date,value){
            return value;
        }
    };

     // static variable
     ACTION_NAMESPACE="data-calendar-";

     DAY_SELECTED=ACTION_NAMESPACE+"day";
     MONTH_SELECTED=ACTION_NAMESPACE+"month";
     VIEW_TOGGLE=ACTION_NAMESPACE +"view-toggle";

     DATE_PREV=ACTION_NAMESPACE+"date-prev";
     DATE_NEXT=ACTION_NAMESPACE+"date-next";
     MONTH_PREV=ACTION_NAMESPACE+"month-prev";
     MONTH_NEXT=ACTION_NAMESPACE+"month-next";

    var Calendar = function(element,options){
        this.$element = $(element);
        this.options=$.extend({},$.fn.calendar.defaults,options);
        this.width=this.options.width;
        this.height=this.options.height;
        this.date=this.options.date;   
        this.w=this.width/this.options.weekName.length,
        this.h=this.height/7;
        this.init();
    };

    Calendar.VERSION='1.0.0';
    Calendar.prototype={
        constructor:Calendar,
        init:function(){
            this.render();
            this.event();
        },
        render:function(){
            var year = this.date.getFullYear(),
                month = this.date.getMonth()+1;
                day = this.date.getDate();
            this.selectYear=year;
            this.selectMonth=month;
            this.selectView=this.options.view;

            var html=['<div class="calendar-container" style="width:'+this.width+'px;height:'+(this.height+40)+'px;">',
                        '<div class="calendar-view">',
                        '<div class="view view-date">',
                        '<div class="calendar-hd" >',
                        '<div class="view-toggle" '+VIEW_TOGGLE+' ></div>',
                        '<div class="arrow-box"><a class="prev" '+DATE_PREV+'><</a><a class="next" '+DATE_NEXT+'>></a></div>',
                        '</div>',
                        '<div class="calendar-ct"></div>', 
                        '</div>',//view-date
                        '<div class="view view-month">',
                        '<div class="calendar-hd" >',
                        '<div class="view-toggle" '+VIEW_TOGGLE+' ></div>',
                        '<div class="arrow-box"><a class="prev" '+MONTH_PREV+'><</a><a class="next" '+MONTH_NEXT+'>></a></div>',
                        '</div>',
                        '<div class="calendar-ct"></div>', 
                        '</div>',//view-month
                        '</div>',//calendar-view
                        '</div>'].join('');
            
            this.$element.html(html);
            this.setView(this.selectView,year,month);            
        },
        event:function(){
            //day selected
            var _this=this;
            _this.$element.on("click",'['+DAY_SELECTED+']',function(){
                _this.onSelectedDay($(this));     
            });

            //month selected
            _this.$element.on("click",'['+MONTH_SELECTED+']',function(){
                _this.onSelectedMonth($(this));     
            });

            // date/month view change
            _this.$element.on("click",'['+VIEW_TOGGLE+']',function(){
                _this.onViewChange($(this));
            });

            // prev month
            _this.$element.on("click",'['+DATE_PREV+']',function(){
                 _this.onSelectedPrevMonth($(this)); 
            });

            // next month
            _this.$element.on("click",'['+DATE_NEXT+']',function(){
                 _this.onSelectedNextMonth($(this));     
            });

            // prev year
            _this.$element.on("click",'['+MONTH_PREV+']',function(){
                    _this.onSelectedPrevYear($(this));     
            });

            // next year
            _this.$element.on("click",'['+MONTH_NEXT+']',function(){
                    _this.onSelectedNextYear($(this));     
            });

        },
        onSelectedDay:function($target){
            if($target.hasClass("new")){
                if(!$target.hasClass("now")) $target.addClass("active").siblings().removeClass("active");                
                if(typeof this.options.onSelected=='function'){
                    this.options.onSelected.call($target,$target.data("date"));
                }
            }   
        },
        onSelectedMonth:function($target){
            var d = $target.data("date").split('/');
            var y=parseInt(d[0]),
                m=parseInt(d[1]);
            this.setView('date',y,m);
            this.selectMonth=m;
        },
        onSelectedPrevMonth:function(){
            var _this=this,
                prevMonth=new Date(this.selectYear,this.selectMonth-1-1,1);
            this.selectYear=prevMonth.getFullYear();
            this.selectMonth=prevMonth.getMonth()+1;

            var $ct=this.$element.find(".view-date .calendar-ct .day");
            $ct.animate({
                marginLeft:'50px'
            },200,'swing',function(){
                _this.updateDateView(prevMonth.getFullYear(),prevMonth.getMonth()+1);
                $ct.css('margin-left','0px');
            });
        },
        onSelectedNextMonth:function(){
            var  _this=this,
                nextMonth=new Date(this.selectYear,this.selectMonth-1+1,1);
            this.selectYear=nextMonth.getFullYear();
            this.selectMonth=nextMonth.getMonth()+1;

            var $ct=this.$element.find(".view-date .calendar-ct .day");
            $ct.animate({
                marginLeft:'-50px'
            },200,'swing',function(){
                _this.updateDateView(nextMonth.getFullYear(),nextMonth.getMonth()+1);
                $ct.css('margin-left','0px');
            });
        },
        onSelectedPrevYear:function(){
            var _this=this,
                prevYear=this.selectYear-1;            
            this.selectYear=prevYear;

            var $ct=this.$element.find(".view-month .calendar-ct");
            $ct.animate({
                marginLeft:'60px'
            },200,'swing',function(){
                _this.updateMonthView(prevYear);
                $ct.css('margin-left','0px');
            });
        },
        onSelectedNextYear:function(){
            var _this=this,
                nextYear=this.selectYear+1;            
            this.selectYear=nextYear;

            var $ct=this.$element.find(".view-month .calendar-ct");
            $ct.animate({
                marginLeft:'-60px'
            },200,'swing',function(){
                _this.updateMonthView(nextYear);
                $ct.css('margin-left','0px');
            });
        },
        onViewChange:function($target){
            if(this.selectView=="date"){
                this.setView('month',this.selectYear,this.selectMonth);
            }else if(this.selectView=="month"){
                this.setView('date',this.selectYear,this.selectMonth);
            }
        },
        setView:function(view,year,month){
            if(view=="date") {
                if(this.$element.find('.view-date .calendar-ct .week').length==0){
                    this.$element.find('.view-date .calendar-ct').append(this.getWeekHtml());
                }                
                this.updateDateView(year,month);
                this.$element.removeClass('calendar-month').addClass('calendar-date');
            }
            else if(view=="month") {
                this.updateMonthView(year);
                this.$element.removeClass('calendar-date').addClass('calendar-month');
            };
            this.selectView=view;
        },
        updateDateView:function(year,month){
            var $daysHtml=this.getDaysHtml(year,month);
            var $dateView=this.$element.find(".view-date");
            $dateView.find('.calendar-ct .day').remove();
            $dateView.find('.calendar-ct').append($daysHtml);
            $dateView.find('.view-toggle').html(year+'/'+month);

        },
        updateMonthView:function(year){
            var $monthHtml=this.getMonthsHtml(year);
            var $monthView=this.$element.find(".view-month");
            $monthView.find('.calendar-ct .month').remove();
            $monthView.find('.calendar-ct').append($monthHtml);
            $monthView.find('.view-toggle').html(year);
        },
        getWeekHtml:function(){
            var _this=this,
                $week=$('<div class="week"></div>');
            $.each(this.options.weekName,function(i,n){
                $week.append('<div class="item" style="width: '+_this.w+'px; height: '+_this.h+'px;overflow:hidden;">'+n+'</div> ');
            });
            return $week;
        },
        getDaysHtml:function(year,month){
            var firstDay = Date.firstDay(year,month),
                $days=$('<div class="day"></div>');
            //firstDay.getDay();//获得星期的索引
            for(var i=0;i<42;i++){ //共7列，最多6行，
                var _thisDay = new Date(year,month-1,i+1+this.options.startWeek-firstDay.getDay());
                var $dayItem=$('<div data-date="'+_thisDay.format(this.options.format)+'" '+DAY_SELECTED+' style="width: '+this.w+'px; height: '+this.h+'px;overflow:hidden;">'+_thisDay.getDate()+'</div>');
            
                if(_thisDay.getMonth()+1==month){
                    $dayItem.addClass("new");
                    if(_thisDay.getFullYear()==this.date.getFullYear()&&_thisDay.getMonth()==this.date.getMonth() && _thisDay.getDate()==this.date.getDate() )
                        $dayItem.addClass("now");                        
                }else{
                    $dayItem.addClass("old");
                }
                $days.append($dayItem);        
            }
            return $days;
        },
        getMonthsHtml:function(year){
            var $month=$('<div class="month"></div>'),
                w=this.width/4,
                h=this.height/4;
            for(var i=0;i<12;i++){
                var $monthItem=$('<div data-date="'+year+'/'+(i+1)+'" '+MONTH_SELECTED+' style="width: '+w+'px; height: '+h+'px;overflow:hidden;">'+(i+1)+'月</div>');
                if(i==this.date.getMonth() && year==this.date.getFullYear()){
                    $monthItem.addClass("now");                        
                }else{
                    $monthItem.addClass("old");
                }
                $month.append($monthItem);
            }
            return $month;
        }

    };


})(jQuery)