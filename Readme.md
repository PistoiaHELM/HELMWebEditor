# HELM Web Editor #
HELM Web Editor (HWE) is a tool to draw, display and edit HELM molecules, which is built in Javascript.

For general information and user guides, please visit the HELM [wiki page](https://pistoiaalliance.atlassian.net/wiki/spaces/PUB/pages/35028994/HELM+Web-editor)

## How to Install ##

### 1 Install on Tomcat ###
#### 1.1. Install HELM2MonomerService ( HELM2MonomerService.war ) ####

- Download the [war file](https://oss.sonatype.org/#nexus-search;quick~helm2-monomerservice) 
- Copy the war file into this folder on Tomcat server: $TomcatHome$\webapps\

#### 1.2 Install HELM2WebService ( WebService.war ) ####
- Download the [war file](https://oss.sonatype.org/#nexus-search;quick~helm2-webservice) 
- Copy the war file into this folder on Tomcat server: $TomcatHome$\webapps\

#### 1.3 Install HELMWebEditor ( hwe-1.1.0.zip ) ####
- Download the [zip file](https://github.com/PistoiaHELM/HELMWebEditor/releases/)
- Unzip it and copy the *hwe* folder to this folder on Tomcat server: $TomcatHome$\webapps\

**Verification**:
There will be three folders in this folder `$TomcatHome$\webapps\` : HELM2MonomerService, WebService and hwe

- Run HELM Web Editor by loading this url from the browser: `http://SERVER/hwe/examples/App.htm` 

### 2. Install on IIS ###
**Please note that the IIS package is out of date. We recommend using the TomCat instructions above which will give you the latest version.** 

- Download the [zip file](https://github.com/PistoiaHELM/HELMWebEditor/releases)
- Unzip it and copy the *hwe* folder to this folder on IIS Server: `C:\inetpub\wwwroot\`
- Run HELM Web Editor
- Load this url from the browser: `http://SERVER/hwe/`


## How to Build ##

For developer convenience, all JavaScript source code is stored as separate files in the .\helm\ folder. 

There is a _merge.helm.bat, a Windows batch file, which can be used to merge all source code files into one file: .\JSDraw\Pistoia.HELM-uncompressed.js. Alternatively you can use your preferred tools from the many modern JS packaging tools available today. ([webpack](https://webpack.js.org/) as an example).



## How to Access the Demo Version ##

A demo version is available at: 
[http://webeditor.openhelm.org/](http://webeditor.openhelm.org/)
  
**Health warning:**  
The monomers provided may change over time as we do not regulate public use of the monomer manager. The demo version is only available to give interested parties a quick way to try out the functionality and should not be used for serious purposes. 

## Further Information ##


### How to change the monomer repository ###
You can change the HWE configuration, `helm_config.js`, to point to your own monomer repository. 
This config file is in: [https://github.com/PistoiaHELM/HELMWebEditor/blob/master/HELM/source/examples/helm_config.js](https://github.com/PistoiaHELM/HELMWebEditor/blob/master/HELM/source/examples/helm_config.js "https://github.com/PistoiaHELM/HELMWebEditor/blob/master/HELM/source/examples/helm_config.js")


*url* is the parameter should be changed:

The default URL calls the HELMMonomerService which is a RESTful web service that includes an API to retrieve monomers. 


### How to show HELM molecules in view-only mode ###

Technically you need only the Canvas for view-only mode to display HELM structure. The Canvas is JSDraw. So you need to do the following:

- Load Monomer Library using <script type=’text/javascipt’ src=’….’></script>
- Create a DIV as placeholder
- Initialize DIV as a JSDraw viewonly editor


Example Code:


```
<script type="text/javascript" src="http://SERVER/JSDraw/monomerdb20161106.js"></script>
<div id='Div2' dataformat='helm' data="PEPTIDE1{A.C.T.G.C.T.W.G.T.W.E.C.W.C.Q.W}|PEPTIDE2{A.C.T.G.C.T.W.G.T.W.E.Q}$PEPTIDE1,PEPTIDE1,5:R3-14:R3|PEPTIDE2,PEPTIDE1,2:R3-12:R3$$$"></div>
<script type="text/javascript">
    dojo.ready(function () {
        var jsd = new JSDraw("Div2", { width: 800, height: 400, skin: "w8", viewonly: true });
    });
</script>
```

