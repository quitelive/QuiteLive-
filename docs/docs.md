# Quite Live API Docs

#### Endpoints for backend

###### [GET] `/api/get_init_key`
params: **none**

return: `16 bit key`

description: All api calls need a unique key, which it references too

---
###### [POST] `/api/video_feed`

params: `api key`

request with `/api/get_init_key`

description: live video send here via Websockets

###### [GET] `/api/word_list`

params: `api key`

params: `frame start` (start index that wordlist refers to)

params: `frame end` (end index that wordlist refers to)

returns: word list