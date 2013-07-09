# WordPress to Tumblr migration #

Easily migrate your WordPress blog in exported XML to a Tumblr blog

## Managing expectations ##

#### Things this does not do: ####

- Does not import media (need to import these yourself `wp_contents` folder and then update your XML)
- Does not import comments since tumblr does not have any comments
- Does not keep your old URLs (tumblr has an entirely different URL)

#### It should do:

- Will import both title and content to tumblr
- Extract WP tags and put them into tumblr blog
- Create tumblr slugs from WordPress URL
- Potentially save your $24 dollars

## Installing ##

The migration tools runs as a Chrome Packaged App. So you need the latest Chrome or Chromium installed. It's also currently using an experimental API so for now you'll need to enable **Experimental Extension APIs** under `chrome://flags`

**Once the API gets promoted to stable I will add it to the Chrome app store and this process would be easier but until then you need to do the following.**

### Pre-reqs:

- Install nodeJS

#### Step 1. Register the app with tumblr

I'm not sharing my app registration keys so you will need to [register your app](http://www.tumblr.com/oauth/apps)

Once you registered make note of your *OAuth Consumer Key* and your *Secret Key*

Create a file in the `wp2tumblr` folder called `tumblr_key.json` with your key

    {
    	"consumerKey": "<YOUR CONSUMER KEY>",
    	"consumerSecret": "<YOUR SECRET>"
    }

#### Step 2. Clone the code and install deps

    npm install
    grunt compile

#### Step 3. Install the app

Go to `chrome://extensions/` and drag the folder to extension tab or if you want to do it the hard way enable *Developer mode* and click on *Load unpacked extension…* and choose the wp2tumblr directory


## Running the migration tool ##

Importing in just three easy steps

1. Launch the App from the extension page `chrome://extensions/`
2. Click on the file input and selecting your XML file it will let you know how many blogs it has parsed
3. Authenticate your tumblr account by clicking on the link (called step 2). It will prompt you to login and ask to you the migration tool needs permission to access your account. Once granted it will output your blogs. Click on the blog you want to import into to select it.
4. Click Start Import button
5. Done 


## License MIT
