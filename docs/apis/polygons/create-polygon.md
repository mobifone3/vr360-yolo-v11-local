```curl
curl 'https://smarttravel-vr.mobifone.vn/vr-api/api/hotspot/create' \
  -H 'Accept: application/json' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDY1NzYwMywiZXhwIjoxNzY0NjYxMjAzfQ.wo9EaLc6AIkmJeP_C7bYY7FS3QZjBFJHbTGOtC5gITU' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -b '_ga=GA1.1.1977466219.1764577785; G_ENABLED_IDPS=google; _ga_5GLK95471D=GS2.1.s1764640918$o1$g1$t1764640997$j60$l0$h0; panoee-studio-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDY1NzYwMywiZXhwIjoxNzY0NjYxMjAzfQ.wo9EaLc6AIkmJeP_C7bYY7FS3QZjBFJHbTGOtC5gITU; _ga_FF6GGJFHR7=GS2.1.s1764657529$o4$g1$t1764659010$j52$l0$h0' \
  -H 'Origin: https://smarttravel-vr.mobifone.vn' \
  -H 'Referer: https://smarttravel-vr.mobifone.vn/editor/692bbfe03bdc270013eef860/tour-editor/scene/692bc2be3bdc270013eef886/scene-info' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  --data-raw '{"id":"fake-p_Lm6eRNZzukFl1jLORT5","ath":0,"atv":0,"type":"image","title":"polygon","scene_id":"692bc2be3bdc270013eef886","polygon":true,"polygon_config":{"points":[{"ath":-21.863134438508666,"atv":25.52363377990759},{"ath":-8.496148306155192,"atv":19.957485053206806},{"ath":13.80851302242246,"atv":26.969557325193083},{"ath":-5.9967213963545305,"atv":35.78896553611026},{"ath":-18.53321374772497,"atv":32.82909359306139}]}}'
```

PAYLOAD

```json
{
  "id": "fake-p_Lm6eRNZzukFl1jLORT5",
  "ath": 0,
  "atv": 0,
  "type": "image",
  "title": "polygon",
  "scene_id": "692bc2be3bdc270013eef886",
  "polygon": true,
  "polygon_config": {
    "points": [
      {
        "ath": -21.863134438508666,
        "atv": 25.52363377990759
      },
      {
        "ath": -8.496148306155192,
        "atv": 19.957485053206806
      },
      {
        "ath": 13.80851302242246,
        "atv": 26.969557325193083
      },
      {
        "ath": -5.9967213963545305,
        "atv": 35.78896553611026
      },
      {
        "ath": -18.53321374772497,
        "atv": 32.82909359306139
      }
    ]
  }
}
```

RESPONSE

```json
{
  "msg": "Created successfully",
  "data": {
    "title": "polygon",
    "type": "image",
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
    "polygon": true,
    "polygon_config": {
      "points": [
        {
          "ath": -21.863134438508666,
          "atv": 25.52363377990759
        },
        {
          "ath": -8.496148306155192,
          "atv": 19.957485053206806
        },
        {
          "ath": 13.80851302242246,
          "atv": 26.969557325193083
        },
        {
          "ath": -5.9967213963545305,
          "atv": 35.78896553611026
        },
        {
          "ath": -18.53321374772497,
          "atv": 32.82909359306139
        }
      ]
    },
    "post": null,
    "scene": "692bc2be3bdc270013eef886",
    "itemPrd": null,
    "owner_histories": [],
    "updated_at": "2025-12-02T07:04:57.391Z",
    "created_at": "2025-12-02T07:04:57.391Z",
    "id": "692e8f993bdc270013eeff88"
  }
}
```

## II. DELETE HOTSPOT

```curl
curl 'https://smarttravel-vr.mobifone.vn/vr-api/api/hotspot/delete' \
  -X 'DELETE' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDY1NzYwMywiZXhwIjoxNzY0NjYxMjAzfQ.wo9EaLc6AIkmJeP_C7bYY7FS3QZjBFJHbTGOtC5gITU' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -b '_ga=GA1.1.1977466219.1764577785; G_ENABLED_IDPS=google; _ga_5GLK95471D=GS2.1.s1764640918$o1$g1$t1764640997$j60$l0$h0; panoee-studio-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDY1NzYwMywiZXhwIjoxNzY0NjYxMjAzfQ.wo9EaLc6AIkmJeP_C7bYY7FS3QZjBFJHbTGOtC5gITU; _ga_FF6GGJFHR7=GS2.1.s1764657529$o4$g1$t1764659082$j60$l0$h0' \
  -H 'Origin: https://smarttravel-vr.mobifone.vn' \
  -H 'Referer: https://smarttravel-vr.mobifone.vn/editor/692bbfe03bdc270013eef860/tour-editor/scene/692bc2be3bdc270013eef886/hotspot/692e8f993bdc270013eeff88' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  --data-raw '{"id":"692e8f993bdc270013eeff88"}'
```

PAYLOAD

```json
{
  "id": "692e8f993bdc270013eeff88"
}
```

## III. TYPE

video, link, image, article, point
