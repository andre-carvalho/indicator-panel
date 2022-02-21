# Indicators Panel

Interactive panel of hierarchical indicators.

# Data source configuration

The entry point for supplying data sets to the panel is the configuration file. This file is read when the panel is started and a list of data sets is presented in a graphical list component used to switch between data sets by the user.

To change the configuration file, go to the **/conf** directory and open the **datasource.json** file.

This file has two parts.

The first is an attribute used to define which data set will be selected by default in the user interface data set selector. The accepted value for this attribute is the identifier of a data set element and must exist in the list of data sets.

```json
{
    "defaultSelectorId":"1",
    ...
}
```

The second attribute is the list of data set configuration elements where each data set is defined. A data set configuration defines the file names for the data to be loaded and a path for the CSV files. To complete this configuration element, there are some attributes such as a data set identifier, a short name and the panel title.

The short name is used to display an item in the data set list and the panel title is used to display the main title on the panel bar.

```json
{
    "selectorId":"1",
    "modelFilePath":"data/rmvale/model/ivm_rmvale.json",
    "geoFilePath":"data/rmvale/geo/rm-vale.geojson",
    "mapLegendFilePath":"data/rmvale/geo/legend.json",
    "mapLegendImgPath":"data/rmvale/geo/legend.png",
    "mapLegendTxt":{"left":"Menor vulnerabilidade (índice 0)","right":"Maior vulnerabilidade (índice 1)"},
    "csvPath":"data/rmvale/csv/",
    "shortName":"RM Vale(IVM-COVID-19)",
    "panelTitle":"Índice de Vulnerabilidade Metropolitana à COVID-19"
}
```

An example of the complete configuration file.

```json
{
    "defaultSelectorId":"1",
    "dataSet":[
        {
            "selectorId":"1",
            "modelFilePath":"data/datadir_name/model/the_indicators_model.json",
            "geoFilePath":"data/datadir_name/geo/the_geographic_data_file.geojson",
            "mapLegendFilePath":"data/datadir_name/geo/the_legend_colors.json",
            "mapLegendImgPath":"data/datadir_name/geo/an_external_legend_img.png",
            "mapLegendTxt":{"left":"the text on the left side","right":"the text on the right side"},
            "csvPath":"data/datadir_name/csv/",
            "shortName":"A short name to display in the dataset list selector",
            "panelTitle":"Title text to be displayed on the main bar"
        },
        {
            "selectorId":"2",
            "modelFilePath":"data/another_dir_name/model/the_indicators_model.json",
            "geoFilePath":"data/another_dir_name/geo/the_geographic_data_file.geojson",
            "mapLegendFilePath":"data/another_dir_name/geo/the_legend_colors.json",
            "mapLegendImgPath":"data/another_dir_name/geo/an_external_legend_img.png",
            "mapLegendTxt":{"left":"the text on the left side","right":"the text on the right side"},
            "csvPath":"data/another_dir_name/csv/",
            "shortName":"A short name to display in the dataset list selector",
            "panelTitle":"Title text to be displayed on the main bar"
        }
    ]
}
```

## The structure of the data set

A data set is arranged in the directory below the **/data** directory.

The input data to feed the panel is projected based on two parts for the indicator data, the model and the raw data in CSV format, and one part for the geographic data. Both the model and the raw data are designed to work together.

Optionally, a set of PDF files is supported to describe each indicator in more detail.

The dataset structure in data directory is like this:

```path
root_project/ (the root directory of this project)
root_project/data/ (the main data directory for this project)
root_project/data/datadir_name/ (the directory for a data set)
root_project/data/datadir_name/model/ (the directory for the dataset model file)
root_project/data/datadir_name/geo/ (the directory for the geographic file and the legend color file)
root_project/data/datadir_name/csv/ (the directory for the collection of the CSV files)
root_project/data/datadir_name/pdf/ (the directory for the collection of the PDF files)
```

### Model
----

The model is a JSON file that guides the loading of raw data in CSV format and this hierarchical structure is used to display a TreeView component in the panel. Any number of levels is supported, but a maximum of six levels is recommended.

The model defines the hierarchy of the indicator starting at the root node. The identification on each node is the **"key"** attribute and is part of the name of each CSV file. Each **"key"** must be unique for each dataset model file.

Each **"key"** is used to load a CSV file. The name of each CSV file, related to each node in the TreeView structure, is defined by the **"key"** of the parent node and the **"key"** corresponding to the desired node. A particular case is the root node that does not have the parent, so the name of the CSV file is the value of **"key"** attribute for that node. See the **"Raw data"** section for more details.

The location of the model file is in the **/model** directory in the base path of the data set and its name is parameterized in the data source configuration file.

The model is formatted as JSON and its structure should follow this example.
```json
{
    "dataversion":"the_version_of_the_data",
    "key":"the_root_node_key",
    "description":"Any text to describe the root node",
    "externalfile":"The name of the PDF file that describes the indicator",
    "nodes":[
        {
            "key":"key_node_1",
            "description":"Any text to describe the node",
            "externalfile":"The name of the PDF file that describes the indicator",
            "nodes":[
                {
                    "key":"key_node_2",
                    "description":"Any text to describe the node",
                    "externalfile":"The name of the PDF file that describes the indicator",
                },
                {"more nodes with or without child nodes"},
                {"more nodes with or without child nodes"}
            ]
        },
        {"more nodes with or without child nodes"},
        {"more nodes with or without child nodes"}
    ]
}
```

### Raw data (CSVs)
----

The raw data is based on a set of CSV files. For each one, the name of the CSV file must be formed by the value of the **"key"** attribute of the desired node preceded by the value of the **"key"** of the parent node separated by the dash character, such as: root.csv, root-key1.csv, key1-key2.csv ...

Following the example template from the **"Model"** section, the corresponding set of CSV data files should be:
```
the_root_node_key.csv
the_root_node_key-key_node_1.csv
key_node_1-key_node_2.csv
...
```

A CSV is formatted with the column names on the first line and the data on the other lines, as the follows:
```csv
"geocode","value"
3502507,"0,333252595573582"
3503158,"0,83392263959669"
3503505,"1"
...
```
The "geocode" column must be the same used as an identifier in the geographic data file to ensure the correct association between the indicator value and the polygons on the map.

The "value" column accepts the data range between zero (0) and one (1) and supports the comma or point as a floating point delimiter. To avoid the error when loading the data, use the double quotation mark to place the records in the "value" column, as the columns record delimiter is a comma.

Column names **"geocode"** and **"value"** are required. Other columns are ignored and it is not recommended because the size of the files affects the loading time of the data.

### Description data (PDFs)
----

For each indicator represented by a node in the TreeView, a PDF with the description is supported. To do this, use the **"externalfile"** attribute in the model file node definition, pointing to the desired PDF file located in the pdf directory. See the **"Model"** section for more details.

```json
{
    "key":"key_node_1",
    "description":"Any text to describe the node",
    "externalfile":"some_name.pdf"
}
```

If the **"externalfile"** attribute exists, a link to the file will be displayed in the details area and, if selected, the file will be opened in a modal window.

### Geographical data
----

[GeoJSON](https://geojson.org/) is the format used to provide geographic data for the map. The expected geographic data is polygons or multipolygons. This format is provided by most modern GIS software such as QGIS and GeoServer.

The GeoJSON file can be generated using the QGIS export feature and an input shapefile file.

The names of the attributes associated with the geographic data must be **"gc"** and **"nm"**. Their names are the alias for **"geocoding"** and **"name"**. Reducing attribute names is a technique for reducing the size of the GeoJSON file.

As a unique identifier for each polygon, we use the **"gc"** attribute, which is mandatory and must be the same used in each CSV data file to link the indicators and the corresponding polygon.

Place the geographic data file in the **/geo** directory in the base path of the data set. The file name is parameterized in the data source configuration file. See the **"Data source configuration"** section for more details.

The projection tested is Geographic/SIRGAS2000 corresponding to the proj4 code: "EPSG: 4674"

## Licenses

There is a lot of software used in this work. Any of these software has a license to use and permission to modify code, so we publicize each one below.

 > D3 https://github.com/d3/d3/blob/master/LICENSE

 > Leaflet https://github.com/Leaflet/Leaflet/blob/master/LICENSE

 > JQuery https://jquery.org/license/

 > Bootstrap https://github.com/twbs/bootstrap/blob/master/LICENSE

 > ClassyBrew: https://github.com/tannerjt/classybrew/blob/master/LICENSE.txt

### Thanks for the sample code

To build my TreeView i use this example.
 > https://jsfiddle.net/awolf2904/bf43jws1/

 > https://observablehq.com/@d3/collapsible-tree

To build the map i see this example.
 > https://leafletjs.com/examples/choropleth/

To implement the slicing options, this example is useful.
 > http://tannerjt.github.io/classybrew-www/examples/basic/

### Author

Any questions, please use the email: afacarvalho@yahoo.com.br
