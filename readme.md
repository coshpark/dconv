
Simple PDF Converter Server
================================

* MS Office (Word, Excel, PowerPoint)
* Hancom Office (Hangul)


Install
------------

* Windows 10 / 2019 Server
* WSL (Windows subsystem for Linux)
* Redis (on WSL)

    $ sudo apt install redis-server

* MS Office & Hancom
* AutoHotkey

Config
----------
	
	mdkir files
	copy config.js.example config.js

Change config.js for your environment.

Run
----------

	bash -c "sudo service redis-server restart"
	start npm run start
	start npm run cron
