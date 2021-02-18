const ck = 'srcb_cookie'
const cv = $persistentStore.read(ck)
if (!cv) {
    $notification.post('missing cookie', '', '请打开srcb app重新获取cookie')
    $done()
}

var raw = "{\"mobileNo\":\"13816610188\",\"productId\":18938,\"promotionId\":2106,\"cardInfo\":{\"id\":8842589,\"maFlag\":\"1\",\"bankCode\":null,\"userId\":null,\"cardNoAlis\":\"6226******5856\",\"cardType\":\"1\",\"branchCode\":\"3137\",\"branchName\":null,\"ccardProduct\":\"0045\",\"empCardFlag\":null,\"defaultFlag\":\"1\",\"member\":null,\"createTime\":null,\"cardStat\":\"\",\"cardSignPoint\":\"NO\",\"selected\":true},\"promProdInfo\":{\"id\":11921,\"bankCodes\":\"6501\",\"productId\":18938,\"promotionId\":2106,\"productNo\":\"218741\",\"rebateType\":\"1\",\"promProductSummary\":\"\",\"promProductName\":\"\",\"promProductStock\":11,\"warnStock\":0,\"saledStock\":1249,\"rebateVal\":null,\"invoiceRate\":1.06,\"purseId\":\"S00000000904620201012\",\"rightPrice\":1,\"subsidyMode\":\"1\",\"subsidyRemark\":null,\"subsidyPrice\":null,\"productType\":\"1\",\"fullCredits\":1,\"partCredits\":0,\"partPrice\":0,\"salePrice\":0,\"returnCommissionFlag\":null,\"isDeleted\":\"0\",\"istmentRateRule\":null,\"stockFlag\":\"1\",\"linkInformation\":null,\"deferUseFlag\":null,\"fixedCostSettleFlag\":\"0\",\"vendorCostPrice\":null,\"cupdCostPrice\":null,\"promMarketPrice\":null,\"productPic\":null,\"validDays\":null,\"frontSort\":null,\"percent\":\"0.87\",\"stages\":null},\"productBreed\":\"E\",\"productType\":\"1\",\"campId\":\"896\",\"orderNumber\":\"\",\"orderChannel\":\"MobileApp\",\"smsCode\":\"\",\"capcode\":\"1609812947468\"}";

var dst = "https://ccmall.srcb.com"
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
                        expired = true
                        resolve()
                        return
                    }
                    let stData = JSON.parse(data)
                    if (stData["status"] == 0) {
                        succ = true
                        console.log(`id: ${id} 成功`)
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


async function all(){
    await Promise.all([reqSrcb(0)])
    $done()
}


all()
