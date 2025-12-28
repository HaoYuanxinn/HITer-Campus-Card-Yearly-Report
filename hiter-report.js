(function() {
    window.allCanteenData = window.allCanteenData || new Map();
    console.clear();
    console.log("%c ? HITer 校园卡年度消费报告 ", "color: #fff; background: linear-gradient(to right, #6a11cb, #2575fc); padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 16px;");
    console.log("%c请翻页采集数据，完成后在下方输入 %creport()%c 查看你的专属年度总结", "color: #666;", "color: #2575fc; font-weight: bold;", "color: #666;");

    const oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this.addEventListener('load', function() {
            if (url.indexOf("GetPersonTrjn") !== -1) {
                try {
                    const res = JSON.parse(this.responseText);
                    if (res && res.rows) {
                        res.rows.forEach(item => window.allCanteenData.set(item.RO, item));
                        console.log(`%c [同步] 已捕获 ${window.allCanteenData.size} 条流水 `, "color: #2575fc; background: #eef2ff; padding: 2px 5px; border-radius: 4px;");
                    }
                } catch (e) {}
            }
        });
        return oldOpen.apply(this, arguments);
    };

    window.report = function() {
        const rows = Array.from(window.allCanteenData.values());
        if (rows.length === 0) return console.error("库中无数据，请先翻页！");

        // 处理数据
        const allRecords = rows.filter(r => r.TRANAMT < 0).map(r => {
            const t = new Date(r.OCCTIME.replace(/-/g, '/'));
            const merc = (r.MERCNAME || "").trim();
            const h = t.getHours();
            const totalMin = h * 60 + t.getMinutes();
            let cat = "饮食";
            if (merc.includes("车载POS")) cat = "巴士";
            else if (merc.includes("深澜") || merc.includes("网费")) cat = "网费";

            return {
                amt: Math.abs(r.TRANAMT),
                date: r.OCCTIME.split(' ')[0],
                month: r.OCCTIME.substring(0, 7),
                h, m: t.getMinutes(),
                totalMin, merc, cat,
                fullTime: r.OCCTIME
            };
        });

        const mealData = allRecords.filter(r => r.cat === "饮食");
        const busData = allRecords.filter(r => r.cat === "巴士");
        const activeDays = [...new Set(mealData.map(r => r.date))];
        const dayCount = activeDays.length || 1;
        const totalMealAmt = mealData.reduce((s, r) => s + r.amt, 0);

        // 饮食排行计算
        const mercCounts = {};
        mealData.forEach(r => mercCounts[r.merc] = (mercCounts[r.merc] || 0) + 1);
        const sortedMercs = Object.entries(mercCounts).sort((a,b) => b[1] - a[1]);

        // 三餐分组
        const mealGroups = {
            '早餐': mealData.filter(r => r.totalMin >= 300 && r.totalMin < 630),
            '午餐': mealData.filter(r => r.totalMin >= 630 && r.totalMin < 930),
            '晚餐': mealData.filter(r => r.totalMin >= 960 && r.totalMin < 1320)
        };

        // 称号
        let title = "工大食堂路人甲";
        if (dayCount > 200) title = "工大食堂荣誉校友";
        else if (dayCount > 100) title = "工大干饭积极分子";
        else if (dayCount > 50) title = "工大食堂常客";

        //  巴士时段计算
        const busHourCounts = {};
        busData.forEach(r => busHourCounts[r.h] = (busHourCounts[r.h] || 0) + 1);
        const peakBusEntry = Object.entries(busHourCounts).sort((a,b) => b[1] - a[1])[0] || [0, 0];
        const peakBusHour = parseInt(peakBusEntry[0]);

        //  输出报告 
        console.clear();
        const line = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
        console.log("%c HITer 校园卡年度消费报告 ", "color: #fff; background: linear-gradient(to right, #6a11cb, #2575fc); padding: 15px 80px; border-radius: 10px; font-weight: bold; font-size: 24px;");
        
        // 1. 饮食消费
        console.log(`\n%c [ 饮食篇 ] `, "background: #e67e22; color: white; padding: 4px 12px; border-radius: 15px; font-weight: bold;");
        console.log(`这一年有 %c${dayCount}%c 天，你都用校园卡消费，解锁 %c“${title}”%c 称号`, "color: #e67e22; font-weight: bold; font-size: 14px;", "", "color: #e67e22; font-weight: bold; font-size: 14px;", "");
        console.log(`全年累计就餐次数：%c${mealData.length}%c 次 | 总支出：%c${totalMealAmt.toFixed(2)}%c 元`, "font-weight: bold", "", "font-weight: bold", "");
        console.log(`平均每日伙食费：%c?${(totalMealAmt/dayCount).toFixed(2)}%c | 日均用餐：%c${(mealData.length/dayCount).toFixed(2)}%c 次`, "color: #c0392b", "", "color: #c0392b", "");
        console.log(`%c“每一个曾按时吃饭的日子，都是对生命的不辜负。”`, "color: #7f8c8d; font-style: italic;");

        // 2. 月度趋势
        console.log(`\n%c ? 饮食月度趋势 `, "background: #f5af19; color: white; padding: 2px 10px; border-radius: 10px;");
        const monthStats = {};
        mealData.forEach(r => monthStats[r.month] = (monthStats[r.month] || 0) + r.amt);
        const maxMonth = Math.max(...Object.values(monthStats), 1);
        Object.entries(monthStats).sort().forEach(([m, v]) => {
            const bar = "█".repeat(Math.round((v/maxMonth)*25));
            console.log(`%c${m}%c | %c${bar}%c ?${v.toFixed(2)}`, "color: #666", "", "color: #f5af19", "");
        });

        // 3. 三餐画像
        console.log(`\n%c ? 三餐行为画像 `, "background: #4facfe; color: white; padding: 2px 10px; border-radius: 10px;");
        const bfCount = mealGroups['早餐'].length;
        
        Object.keys(mealGroups).forEach(k => {
            const list = mealGroups[k];
            if(list.length > 0) {
                const avg = list.reduce((s,r)=>s+r.amt,0)/list.length;
                const avgT = list.reduce((s,r)=>s+r.totalMin,0)/list.length;
                console.log(`%c${k}%c -> 次数: ${list.length} | 均价: ?${avg.toFixed(2)} | 平均饭点: ${Math.floor(avgT/60)}:${String(Math.floor(avgT%60)).padStart(2,'0')}`);
            }
        });

        let bfEval = bfCount >= 150 ? "【规律早八的 HITer】早起的你是校园里最靓的仔，拥有最充沛的清晨活力！" : 
                     (bfCount < 40 ? "【不吃早餐的哈工大er】记得再忙也要给胃一点温暖，新的一年试着早起五分钟。" : 
                     "【偶尔早起的奋斗者】那些清晨的阳光，一定见证过你努力奔跑的时刻。");
        console.log(`%c${bfEval}`, "color: #34495e; font-weight: bold; font-style: italic;");

        const bfSorted = [...mealGroups['早餐']].sort((a,b) => a.totalMin - b.totalMin);
        if(bfSorted[0]) console.log(`%c${bfSorted[0].date} ${bfSorted[0].fullTime.split(' ')[1]}%c 是你最早的一顿早餐，还记得那天早起的自己吗？`, "color: #27ae60; font-weight: bold", "");

        // 4. 年度最爱 Top 5
        console.log(`\n%c ? 我的年度饭菜频率 Top 5 `, "background: #ee0979; color: white; padding: 2px 10px; border-radius: 10px;");
        const top5 = sortedMercs.slice(0, 5);
        if(top5.length > 0) {
            top5.forEach(([name, count], i) => {
                const bar = "▓".repeat(Math.round((count/top5[0][1])*20));
                console.log(`No.${i+1} %c${name.padEnd(12)}%c | %c${bar}%c ${count}次`, "font-weight: bold", "", "color: #ee0979", "");
            });
            console.log(`\n%c“${top5[0][0]}”%c 好像是你很喜欢的窗口，这一年你光顾了它 %c${top5[0][1]}%c 次。`, "color: #ee0979; font-size: 14px; font-weight: bold", "", "color: #ee0979; font-weight: bold", "");
            console.log(`%c这份美味，荣登你的哈工大必吃榜榜首。`, "color: #ee0979; font-style: italic");
        }

        // 5. 探店足迹
        console.log(`\n%c ? 探店足迹与关键词 `, "background: #00b09b; color: white; padding: 2px 10px; border-radius: 10px;");
        const uniqueCount = sortedMercs.length;
        let explorerEval = uniqueCount >= 100 ? " HIT 探店专家！你几乎把学校吃了个遍。" : 
                           (uniqueCount >= 50 ? "工大美食猎人，总能精准捕捉到隐藏的美味。" : 
                           "专一的哈工大er，熟悉的味道最温馨。");
        console.log(`全年一共吃过 %c${uniqueCount}%c 种不同的饭。%c${explorerEval}`, "font-weight: bold; color: #00b09b;", "", "color: #00b09b");

        // 关键词逻辑
        const wordCounts = {};
        mealData.forEach(r => {
            const words = r.merc.match(/[\u4e00-\u9fa5]{1}/g) || [];
            words.forEach(w => { if(!"校园食堂一二三区学苑美食".includes(w)) wordCounts[w] = (wordCounts[w] || 0) + 1 });
        });
        const topWord = Object.entries(wordCounts).sort((a,b) => b[1] - a[1])[0] || ["鲜", 0];
        console.log(`本年度食堂关键词是：%c ${topWord[0]} %c`, "background: #00b09b; color: white; padding: 2px 10px; border-radius: 5px; font-size: 20px; font-weight: bold", "");
        const kwEval = topWord[0] === "面" ? "面面俱到，生活如意。" : (topWord[0] === "饭" ? "好好吃饭，人间烟火。" : "生活的滋味，尽在其中。");
        console.log(kwEval);



        // 6. 校园巴士
        console.log(`\n%c [ 校园巴士篇 ] `, "background: #e67e22; color: white; padding: 2px 10px; border-radius: 10px;");
        console.log(`2025 年累计乘坐 %c${busData.length}%c 次 | 支出 ?${busData.reduce((s,r)=>s+r.amt,0).toFixed(2)}`, "font-weight: bold", "");
        
        let busEval = peakBusHour <= 9 ? "迎着朝阳奔赴的身影，是梦想在发光。" : 
                     (peakBusHour >= 19 ? "披星戴月的夜晚见证了你的坚持，每一步都算数。" : 
                     "在校园里穿梭，见证了你的日出与日落。");
        console.log(`你最常在 %c${peakBusHour}:00 - ${peakBusHour+1}:00%c 乘车。${busEval}`, "color: #3498db; font-weight: bold", "");
        
        const latestBus = [...busData].sort((a,b) => b.totalMin - a.totalMin)[0];
        if(latestBus) {
            console.log(`最晚一次乘车在 %c${latestBus.fullTime.split(' ')[0]} ${latestBus.fullTime.split(' ')[1]}%c，深夜里的星月，皆是你的见证。`, "color: #8e44ad; font-weight: bold", "");
        }

        console.log(`\n%c 解锁年度称号：%c${dayCount > 180 ? 'HIT 校园生活家' : 'HIT 时间管理者'} `, "font-weight: bold;", "background: #1a2a6c; color: white; padding: 3px 10px; border-radius: 5px;");
        console.log(line);
        return "报告生成完毕";
    };
})();