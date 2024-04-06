# mlat-server-sync-map (ezz456CH Fork)
Map and sync table to show sync status for mlat-server

How to use(maybe not 100% correct but it should work)

1.Clone this repo(in this case i will clone to /opt/table)

```
git clone https://github.com/ezz456CH/mlat-server-sync-map.git /opt/table/
```

2.Add web server config

I use lighttpd, so here is an alias.url example

```
alias.url += (
    "/mlat-map/" => "/opt/table/syncmap/",
    "/sync/" => "/opt/table/synctable/"
)
```

3.Run the do_sync.sh script as sudo

```
cd /opt/table/synctable/script
sudo ./do_sync.sh
```

If you have cloned it to another path, you may need to edit do_sync.sh syncpath first!

4.cd to 1A and add a symlink to mlat-server sync.json

```
sudo ln -sf /run/mlat-server/sync.json /opt/table/synctable/1A/sync.json
```

5.Set up a cron job to run the script every minute

(in this example i will edit directly /etc/crontab)

```
sudo nano /etc/crontab
```

than add this line

```
*  *    * * *   root    /opt/table/synctable/script/do_sync.sh
```

To ensure it works, I would recommend adding execute permission to the script

```
sudo chmod +x /opt/table/synctable/script/do_sync.sh
```

Note: The access token in overlay.js is restricted to specific URLs. If you will use it, don't forget to change the "access_token" in overlay.js. Otherwise, the map won't display

Alternatively, you can change to another map if you want (=^･ω･^=)