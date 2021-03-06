## TinawebJS ProjectExplorer

This package is:
  - a JS client-side data explorer based on a graph-view of terms and the vizualisation of related information (word stats, search in a document base).
  - complemented with a few companion backends and tools


#### Basic usage
The app can be tested by simply opening explorerjs.html and providing a graph in `json` or `gexf` format (see exemples in the `data/` dir.)


#### Input file setup and advanced usage
ProjectExplorer allows 4 main ways of input :
  - **localfile**: a local file from the client machine  
  - **serverfile**: a static file from the remote server  
  - **servermenu**: a list of static files from the remote server  
  - **api**: a dataset from a remote server API  

To set up the desired mode, you need to change the (`TW.conf.sourcemode`) value in settings_explorerjs.js or add `sourcemode=xxx` as a URL argument.

See [the developer's manual](https://github.com/moma/ProjectExplorer/blob/master/00.DOCUMENTATION/C-advanced/developer_manual.md) for more information.

#### Integration policy
As a client-side lib, **tinawebJS can entirely reside in the `static` directory of your app**.

For the rest of the exemples we assume you cloned the code in a directory called `path/to/yourapp/static/ProjectExplorer`

So the procedure to integrate is basically just to extract the tinawebJS distribution in your `static` directory.

There are two exceptions are the html page and the companion backends:
  - you can adapt paths for the html starting point itself to any url prefix:  
    1) go into the root directory of projectExplorer in your static dir
    ```
    # with our exemple
    cd path/to/yourapp/static/ProjectExplorer
    ```

    2) apply the changing paths tool `adapt_html_paths.sh` like this:
    ```
    bash twtools/adapt_html_paths.sh 'static/projectExplorer/'
    #                                ------------------------
    #                      the relative url prefix in your deployment routes
    ```
    this creates a new file: `explorerjs.prod.html`

    3) now just link to the new file from your html dir or templates dir
    ```
    # cd back/to/your/app/root (or html files dir)
    cd ../../  
    ln -s static/ProjectExplorer/explorerjs.prod.html explorerjs.html

    # now `ls -l` should show something like this:
    # - HTML ELEMENTS OF YOUR APP
    # - HTML ELEMENTS OF YOUR APP
    # - explorerjs.html -> static/ProjectExplorer/explorerjs.prod.html
    ```

    4) finally update the settings property `ourlibs` (path to twlibs) with the same URL prefix
    ```
    nano static/ProjectExplorer/settings_explorerjs.js

      ----------------- [IN NANO] --------------------
       (...)
       TWConf.paths = {
         'ourlibs': 'static/ProjectExplorer/twlibs',    // <=== here
         ...
       }
       (...)
      -----------------------------------------------
    ```

    - to use it within a different GUI layout: take our html as an exemple and create your own html importing the same libs and exposing the same div ids.
    - the directory `twpresets/` contains specific variants of `settings_explorerjs` for some common deployment tasks of the ISCPIF (comex, gargantext)


  - optionally, to deploy the backends under `twbackends`:

      1) they are the only server-side elements of the tina distribution. While part of the distribution, they are **standalone micro-servers**.

      2) they contain their own documentation as to how to run them on a webserver
      - for the twitter backend setup, you should follow [this section of the twitterAPI readme](https://github.com/moma/ProjectExplorer/blob/master/twbackends/twitterAPI2/README.md#on-a-real-server)
      - for the CSV/CortextDB backend, the easiest is to serve the php files as an additional location of your static server, as explained in the [this section of the PHP backend's readme](https://github.com/moma/ProjectExplorer/blob/master/twbackends/phpAPI/README.md#prerequisites)  

    3) once they are running, the communication between them and the main tinaweb client module happens via XHR requests: therefore they can actually reside in any convenient place for your deployment. You just need to set the http paths accordingly in the `relatedDocsAPIS` entry of ProjectExplorer's settings. For instance, with the locations suggested in the documentation above, the configuration in `settings_explorerjs.js` would be like this:
      ```
      nano static/ProjectExplorer/settings_explorerjs.js

        ----------------- [IN NANO] --------------------
         (...)
         TWConf.relatedDocsAPIS = {
             "twitter": "http://127.0.0.1:5000/twitter_search",
             "CortextDB": "twbackends/phpAPI",
             "csv": "twbackends/phpAPI"
         }
         (...)
        -----------------------------------------------
      ```

    4) finally, to use these backends as related documents search engines for a given graph, you'll need to configure your `project_conf.json` file [as explained here](https://github.com/moma/ProjectExplorer/blob/master/00.DOCUMENTATION/A-Introduction/project_config.md#more-relateddocs-settings). You can also find real-life examples in this distribution's `data/test/project_conf.json` file.
