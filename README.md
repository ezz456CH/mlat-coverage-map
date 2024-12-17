# mlat-coverage-map

Map and sync table to show sync status for mlat-server

This is a fork of wiedehopf's version of mlat-server-sync-map.

## How to use

1.Clone this repo to /opt/mlat-coverage-map/

```
git clone https://github.com/ezz456CH/mlat-coverage-map.git /opt/mlat-coverage-map/
```

## 2.Add web server config

Example

lighttpd:

```
alias.url += (
    "/mlat-map/" => "/opt/mlat-coverage-map/mlat-map/",
    "/mlat-syncstats/" => "/opt/mlat-coverage-map/mlat-syncstats/"
)
```

nginx:

```
location ~ ^/mlat-map(/.*)?$ {
    alias /opt/mlat-coverage-map/mlat-map$1;
}

location ~ ^/mlat-syncstats(/.*)?$ {
    alias /opt/mlat-coverage-map/mlat-syncstats$1;
}
```

## 3.Run the do_sync.sh script as sudo

```
cd /opt/mlat-coverage-map/mlat-syncstats/script
sudo ./do_sync.sh
```

Note: If you have cloned it to another path, you may need to edit syncpath in do_sync.sh first!

## 4.cd to 1A and add a symlink to mlat-server sync.json

```
sudo ln -sf /run/mlat-server/sync.json /opt/mlat-coverage-map/mlat-syncstats/1A/sync.json
```

## 5.Set up a cron job to run the script every minute

(in this example i will directly edit /etc/crontab file)

```
sudo nano /etc/crontab
```

than add this line

```
*  *    * * *   root    /opt/mlat-coverage-map/mlat-syncstats/script/do_sync.sh
```

To ensure it works, I would recommend adding execute permission to the script

```
sudo chmod +x /opt/mlat-coverage-map/mlat-syncstats/script/do_sync.sh
```

Note: The mapbox access token in overlay.js is restricted to specific URLs. If you will use it, don't forget to change the "mapboxgl.accessToken" in overlay.js. Otherwise, the map won't display
