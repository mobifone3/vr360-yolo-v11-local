```curl
curl 'https://smarttravel-vr.mobifone.vn/vr-api/api/auth/login' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -b 'visid_incap_3181117=r5LFZCRzTKy4HXtSDK48P0/gH2kAAAAAQUIPAAAAAABVXloPeYoxV7Q5KwPXSkyJ; _ga=GA1.1.1578837725.1764632961; G_ENABLED_IDPS=google; _ga_FF6GGJFHR7=GS2.1.s1764720937$o4$g1$t1764724718$j47$l0$h0' \
  -H 'Origin: https://smarttravel-vr.mobifone.vn' \
  -H 'Referer: https://smarttravel-vr.mobifone.vn/account/auth' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  --data-raw '{"email":"hue.smarttravel@mobifone.vn","password":"hue@123456"}'
```

RESPONSE

```json
{
  "msg": "Login successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDcyNDgwNCwiZXhwIjoxNzY0NzI4NDA0fQ.Pcapy53M75-h0RQeT-k4Stxr8epBGvNgn-5gI3mB0-M",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDcyNDgwNCwiZXhwIjoxNzY1MzI5NjA0fQ.RNeHMJca9hzEqo86aEeSbSXyPeH1gGPqdLyGWQi39AU"
}
```
