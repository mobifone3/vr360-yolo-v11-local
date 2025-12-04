## I. UPDATE POST ARTICLE

```curl
curl 'https://smarttravel-vr.mobifone.vn/vr-api/api/hotspot/update' \
  -X 'PUT' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDcyNDgwNCwiZXhwIjoxNzY0NzI4NDA0fQ.Pcapy53M75-h0RQeT-k4Stxr8epBGvNgn-5gI3mB0-M' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -b 'visid_incap_3181117=r5LFZCRzTKy4HXtSDK48P0/gH2kAAAAAQUIPAAAAAABVXloPeYoxV7Q5KwPXSkyJ; _ga=GA1.1.1578837725.1764632961; G_ENABLED_IDPS=google; panoee-studio-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDcyNDgwNCwiZXhwIjoxNzY0NzI4NDA0fQ.Pcapy53M75-h0RQeT-k4Stxr8epBGvNgn-5gI3mB0-M; _ga_FF6GGJFHR7=GS2.1.s1764720937$o4$g1$t1764728211$j60$l0$h0' \
  -H 'Origin: https://smarttravel-vr.mobifone.vn' \
  -H 'Referer: https://smarttravel-vr.mobifone.vn/editor/692bbfe03bdc270013eef860/tour-editor/scene/692f02c83bdc270013ef07f5/hotspot/692f8fb53bdc270013ef0bec' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  --data-raw '{"id":"692f8fb53bdc270013ef0bec","config":{"style":{"type":"icon","effect":"normal","rotate":0,"opacity":100,"size":3,"isShowLabel":false,"image":{},"icon":{"bg_color":"#E54D42"},"marker":{},"callout":{"type":"image","degrees":45}},"article":{"post_id":"692f1aba3bdc270013ef0966"}}}'
```

PAYLOAD

```json
{
  "id": "692f8fb53bdc270013ef0bec",
  "config": {
    "style": {
      "type": "icon",
      "effect": "normal",
      "rotate": 0,
      "opacity": 100,
      "size": 3,
      "isShowLabel": false,
      "image": {},
      "icon": {
        "bg_color": "#E54D42"
      },
      "marker": {},
      "callout": {
        "type": "image",
        "degrees": 45
      }
    },
    "article": {
      "post_id": "692f1aba3bdc270013ef0966"
    }
  }
}
```

RESPONSE

```json
{
  "msg": "Updated successfully.",
  "data": {
    "title": "polygon",
    "type": "article",
    "icon": null,
    "width": 50,
    "height": 50,
    "description": null,
    "category": null,
    "atv": 0,
    "ath": 0,
    "x": 0,
    "y": 0,
    "z": 0,
    "config": {
      "style": {
        "type": "icon",
        "effect": "normal",
        "rotate": 0,
        "opacity": 100,
        "size": 3,
        "isShowLabel": false,
        "icon": {
          "bg_color": "#E54D42"
        },
        "callout": {
          "type": "image",
          "degrees": 45
        }
      },
      "article": {
        "post_id": "692f1aba3bdc270013ef0966"
      }
    },
    "polygon": true,
    "polygon_config": {
      "points": [
        {
          "ath": 22.97200957990458,
          "atv": 30.904032739894625
        },
        {
          "ath": 22.046532494258997,
          "atv": 29.62080318106379
        }
      ]
    },
    "post": null,
    "scene": "692f02c83bdc270013ef07f5",
    "itemPrd": null,
    "owner_histories": [],
    "updated_at": "2025-12-03T02:18:19.065Z",
    "created_at": "2025-12-03T01:17:41.080Z",
    "id": "692f8fb53bdc270013ef0bec"
  }
}
```

## II. UPDATE POLYGON NAME

```curl
curl 'https://smarttravel-vr.mobifone.vn/vr-api/api/hotspot/update' \
  -X 'PUT' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDcyODQ1NCwiZXhwIjoxNzY0NzMyMDU0fQ.tWBYCtvVXq2HpRz50w7IysEnvtGmI5I91Pdw-wY0R4w' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -b 'visid_incap_3181117=r5LFZCRzTKy4HXtSDK48P0/gH2kAAAAAQUIPAAAAAABVXloPeYoxV7Q5KwPXSkyJ; _ga=GA1.1.1578837725.1764632961; G_ENABLED_IDPS=google; panoee-studio-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDcyODQ1NCwiZXhwIjoxNzY0NzMyMDU0fQ.tWBYCtvVXq2HpRz50w7IysEnvtGmI5I91Pdw-wY0R4w; _ga_FF6GGJFHR7=GS2.1.s1764720937$o4$g1$t1764730483$j60$l0$h0' \
  -H 'Origin: https://smarttravel-vr.mobifone.vn' \
  -H 'Referer: https://smarttravel-vr.mobifone.vn/editor/692bbfe03bdc270013eef860/tour-editor/scene/692f02c83bdc270013ef07f5/hotspot/692f8fb53bdc270013ef0bec' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  --data-raw '{"id":"692f8fb53bdc270013ef0bec","title":"hieunq_test_edit"}'
```

PAYLOAD:

```json
{ "id": "692f8fb53bdc270013ef0bec", "title": "hieunq_test_edit" }
```

RESPONSE:

```json
{
  "msg": "Updated successfully.",
  "data": {
    "title": "hieunq_test_edit",
    "type": "article",
    "icon": null,
    "width": 50,
    "height": 50,
    "description": null,
    "category": null,
    "atv": 0,
    "ath": 0,
    "x": 0,
    "y": 0,
    "z": 0,
    "config": {
      "style": {
        "type": "icon",
        "effect": "normal",
        "rotate": 0,
        "opacity": 100,
        "size": 3,
        "isShowLabel": false,
        "icon": {
          "bg_color": "#667eea"
        },
        "callout": {
          "type": "image",
          "degrees": 45
        }
      }
    },
    "polygon": true,
    "polygon_config": {
      "points": [
        {
          "ath": 22.97200957990458,
          "atv": 30.904032739894625
        },
        {
          "ath": 22.046532494258997,
          "atv": 29.62080318106379
        }
      ]
    },
    "post": null,
    "scene": "692f02c83bdc270013ef07f5",
    "itemPrd": null,
    "owner_histories": [],
    "updated_at": "2025-12-03T03:01:38.249Z",
    "created_at": "2025-12-03T01:17:41.080Z",
    "id": "692f8fb53bdc270013ef0bec"
  }
}
```
