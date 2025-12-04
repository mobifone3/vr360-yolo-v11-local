```curl
curl ^"https://smarttravel-vr.mobifone.vn/vr-api/api/account/profile^" ^
  -H ^"Accept: application/json, text/plain, */*^" ^
  -H ^"Accept-Language: en-US,en;q=0.9^" ^
  -H ^"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDY1NzYwMywiZXhwIjoxNzY0NjYxMjAzfQ.wo9EaLc6AIkmJeP_C7bYY7FS3QZjBFJHbTGOtC5gITU^" ^
  -H ^"Connection: keep-alive^" ^
  -b ^"_ga=GA1.1.1977466219.1764577785; G_ENABLED_IDPS=google; _ga_5GLK95471D=GS2.1.s1764640918^$o1^$g1^$t1764640997^$j60^$l0^$h0; panoee-studio-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzBjODVmODQ3Y2RjOTEwOTNjODhkNDEiLCJ0eXBlIjozLCJjcmVhdGVkX2J5IjoiNjY4YmNjN2JlNWM1ZTg3ZjRiMzdmZmUzIiwibGltaXRfdG91ciI6MTAsImlhdCI6MTc2NDY1NzYwMywiZXhwIjoxNzY0NjYxMjAzfQ.wo9EaLc6AIkmJeP_C7bYY7FS3QZjBFJHbTGOtC5gITU; _ga_FF6GGJFHR7=GS2.1.s1764657529^$o4^$g1^$t1764658401^$j60^$l0^$h0^" ^
  -H ^"If-None-Match: W/^\^"171-5Eeu0pldfSqCClCezY4Ff3FPIqk^\^"^" ^
  -H ^"Referer: https://smarttravel-vr.mobifone.vn/editor/692bbfe03bdc270013eef860/tour-editor/scene/692bc2be3bdc270013eef886/scene-info/editor/692bbfe03bdc270013eef860/tour-editor/scene/692e6c7f3bdc270013eefd7e/scene-info/editor/692bbfe03bdc270013eef860/tour-editor/scene/692bc2be3bdc270013eef886/scene-info/editor/692bbfe03bdc270013eef860/tour-editor/scene/692e6c7f3bdc270013eefd7e/scene-info/editor/692bbfe03bdc270013eef860/tour-editor/scene/692e8bef3bdc270013eeff30/scene-info^" ^
  -H ^"Sec-Fetch-Dest: empty^" ^
  -H ^"Sec-Fetch-Mode: cors^" ^
  -H ^"Sec-Fetch-Site: same-origin^" ^
  -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36^" ^
  -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"142^\^", ^\^"Google Chrome^\^";v=^\^"142^\^", ^\^"Not_A Brand^\^";v=^\^"99^\^"^" ^
  -H ^"sec-ch-ua-mobile: ?0^" ^
  -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^"
  ```

  RESPONSE

  ```json
  {
    "data": {
        "_id": "670c85f847cdc91093c88d41",
        "name": "Smart Travel - TTH",
        "first_name": null,
        "last_name": null,
        "email": "hue.smarttravel@mobifone.vn",
        "phone": "0987654321",
        "bio": "",
        "socials": [],
        "avatar_path": null,
        "cover_path": null,
        "type": 3,
        "limit_tour": 10,
        "limit_tour_draft": 10,
        "status": 1,
        "published_projects_count": 6,
        "unpublished_projects_count": 0,
        "avatar": null,
        "cover": null
    }
}
```