const ck = 'srcb_cookie'
const cv = $persistentStore.read(ck)
if (!cv) {
    $notification.post('missing cookie', '', '请打开srcb app重新获取cookie')
    $done()
}

var raw = "{\"mobileNo\":\"13816610188\",\"productId\":18938,\"promotionId\":2106,\"cardInfo\":{\"id\":8842589,\"maFlag\":\"1\",\"bankCode\":null,\"userId\":null,\"cardNoAlis\":\"6226******5856\",\"cardType\":\"1\",\"branchCode\":\"3137\",\"branchName\":null,\"ccardProduct\":\"0045\",\"empCardFlag\":null,\"defaultFlag\":\"1\",\"member\":null,\"createTime\":null,\"cardStat\":\"\",\"cardSignPoint\":\"NO\",\"selected\":true},\"promProdInfo\":{\"id\":11921,\"bankCodes\":\"6501\",\"productId\":18938,\"promotionId\":2106,\"productNo\":\"218741\",\"rebateType\":\"1\",\"promProductSummary\":\"\",\"promProductName\":\"\",\"promProductStock\":11,\"warnStock\":0,\"saledStock\":1249,\"rebateVal\":null,\"invoiceRate\":1.06,\"purseId\":\"S00000000904620201012\",\"rightPrice\":1,\"subsidyMode\":\"1\",\"subsidyRemark\":null,\"subsidyPrice\":null,\"productType\":\"1\",\"fullCredits\":1,\"partCredits\":0,\"partPrice\":0,\"salePrice\":0,\"returnCommissionFlag\":null,\"isDeleted\":\"0\",\"istmentRateRule\":null,\"stockFlag\":\"1\",\"linkInformation\":null,\"deferUseFlag\":null,\"fixedCostSettleFlag\":\"0\",\"vendorCostPrice\":null,\"cupdCostPrice\":null,\"promMarketPrice\":null,\"productPic\":null,\"validDays\":null,\"frontSort\":null,\"percent\":\"0.87\",\"stages\":null},\"productBreed\":\"E\",\"productType\":\"1\",\"campId\":\"896\",\"orderNumber\":\"\",\"orderChannel\":\"MobileApp\",\"smsCode\":\"\",\"capcode\":\"1609812947468\"}";


var dst = "https://ccmall.srcb.com"
dst = "http://10.87.52.81:6789"
dst = "http://10.0.0.137:6789"
dst = "http://10.0.0.72:6789"
dst = "https://ccmall.srcb.com"

var requestOptions = {
    url: dst + "/impMobile/order/initImpOrder",
    headers: {
        Host:"ccmall.srcb.com",
        branchCode:"000000",
        Accept:"application/json, text/plain, */*",
        "Accept-Language":"zh-cn",
        "Content-Type":"application/json;charset=UTF-8",
        Origin:"https://ccmall.srcb.com",
        bankCode:"6501",
        "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CUPD_MBANK_APP",
        Referer:"https://ccmall.srcb.com/impFront/voucherOrder?productId=18938&promotionId=2106&campId=896&groupIndex=0",
        Cookie:cv
    },
    body: raw
}


var finish = 0
var create = 0

var succ = false
var expired = false
function reqSrcb(id) {
    return new Promise(function(resolve) {
        if (succ || expired) {
            resolve()
            return
        }
        let start = new Date()
        $httpClient.post(requestOptions, function(error, response, data){
            try {
                let end = new Date()
                let elapsed = end - start;
                console.log(`id: ${id} http cost ${elapsed} ms`)
                if (error){
                    console.log(`srcb req err ${error}`)
                    
                }else{
                    console.log(`status: ${response.status} data:\n ${data}`)
                    if (response.status == 900) {
                        console.log(`id: ${id} session 过期！！！！！`)
                        $notification.post("srcb 过期！！！", "", data)
                        expired = true
                        resolve()
                        return
                    }
                    let stData = JSON.parse(data)
                    if (stData["status"] == 0) {
                        succ = true
                        console.log(`id: ${id} 成功`)
                        $notification.post("srcb 成功", "", data)
                    }
                }
            } catch (exp){
                console.log("srcb req exception: " + exp)
            } finally {
                resolve()
            }
        })
    })
}

async function parallelReq(id, concurrency) {
    let reqs = []
    create += concurrency
    for (let i = 0;i < concurrency; i++){
        reqs.push(reqSrcb(id * concurrency + i))
    }
    await Promise.all(reqs);
    finish += concurrency
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function done(){
    let end = new Date()
    let begin = Date.parse($script.startTime)
    let totalCost = end - begin
    console.log(`Result: ${succ}, Expired: ${expired}, Total cost ${totalCost} ms, req: ${finish}/${create}`)
    $done()
}

async function count(){
    while (finish < create || create == 0) {
        await sleep(100)
        console.log(`reqs: ${finish}/${create}`)
    }
    done()
}

async function all(concurrency, repeat, interval){
    
    for (let i = 0; i < repeat; i++){
        if (succ || expired){
            break
        }
        parallelReq(i, concurrency) //并发请求, 异步，并不等待
        await sleep(interval)
    }
    //setTimeout(()=>{
    //    done()
    //}, 20000)

}

function wait(shiftms) {
    let cur = new Date()
    targetSeconds = (Math.floor(cur.getSeconds() / 5) + 1) * 5
    let target = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), cur.getHours(), cur.getMinutes(), targetSeconds)
    while (target - cur > shiftms){
        cur = new Date()
    };
    console.log(`shift target ${target} cur ${cur}`)
}

console.log("start time: " + $script.startTime)

var concurrency = 2
var repeat = 70
var interval = 10
var shiftms = 75

count()

wait(shiftms)

all(concurrency, repeat, interval)

