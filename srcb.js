/*

[Script]
srcb Cookie = type=http-request,pattern=https:\/\/ccmall\.srcb\.com\/.*

 
*/
const ck = 'srcb_cookie'
var cv = $request.headers['Cookie']

const ocv = $persistentStore.read(ck)
if (!ocv || ocv != cv) {
    console.log('update cookie')
    console.log(cv)
    var dcv = decodeURIComponent(cv)
    console.log('decoded cookie')
    console.log(dcv)
    $persistentStore.write(cv,ck)
    var title = 'srcb 保存成功'
    var subtitle = ''
    var message = dcv
    $notification.post(title, subtitle, message)
} else {
    console.log('keep old cookie')
}
$done()
