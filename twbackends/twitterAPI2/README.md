A simple relay server to the official Twitter search API
========================================================

## Credentials setup

Like any other Twitter REST API consumer, this app needs twitter authentication credentials.

To get them, go to https://apps.twitter.com/ and register a new app... The url param can be fake.

Once you have your keys and access tokens, create a `keys.json` file on the model of the attached `keys.json.template`, and save it in the same folder as the script.

Remember not to upload your `keys.json` on git !!

## Usage

Run it with the following command:

```
cd twitterAPI2
python3 topPapers_flask_server.py
```

Then you can query the app via `127.0.0.1:5000` like this:

  - `http://127.0.0.1:5000/twitter_search?query=hamon`
    - it returns the exact json from the twitter search
    - tinawebJS will use it in topPapers if you fill "http://127.0.0.1:5000/twitter_search" in the variable TW.APINAME
  - `http://127.0.0.1:5000/twitter_limits`
    - this route informs you how many queries are left until the next 15 minutes renewal time
    - more info on https://dev.twitter.com/rest/public/rate-limiting


#### In local tests
Use the `--cors` option to allow requests from all apps within the local LAN

```
python3 topPapers_flask_server.py --cors
```

#### On a real server
Use nohup or gunicorn to detach the process or make it into a full-fledged server.

For instance for a ProjectExplorer server you can follow these 3 steps.

1. run the backend with nohup
```
cd ${YOUR_PROJECT_EXPLORER_DIR}/twbackends/twitterAPI2
nohup python3 topPapers_flask_server.py &
```
2. add a proxy location to the nginx server's conf:
```
location /twitter_search {
     proxy_pass http://0.0.0.0:5000 ;
     proxy_redirect off ;
}
```

3. fill the corresponding info in ProjectExplorer's settings_explorerjs.js
```
TWConf.relatedDocsAPIS = {
  "twitter": "http://${YOUR_SERVER_IP}/twitter_search",
  (...)
}
```


## More info

```python3 topPapers_flask_server.py --help```
