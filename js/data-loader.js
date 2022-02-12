/**
 * Using the appropriate data model to guide the loading of CSV data.
 */
var dataLoader={
    dataModel:{},
    data:[],// store the type {key:"",values:[]}
    csvPath:null,

    init:async (selectedDataSource)=>{
        dataLoader.csvPath=selectedDataSource.csvPath;
        let data=await dataLoader.loadAllData(selectedDataSource);
        dataLoader.data=data;
        return data;
    },

    loadCSVFile: async (key)=>{
        let d;
        let path=dataLoader.csvPath+key+".csv";
        await d3.csv(path).then(
            (data)=>{
                d=data;
            },
            (error)=>{
                utils.displayError("Falha ao tentar ler o(s) arquivo(s) ("+path+")", true);
            }
        );
        return d;
    },

    loadDataModel: async (selectedDataSource)=>{
        let dm;
        await d3.json(selectedDataSource.modelFilePath).then(
            (data, error)=>{
                if (error) throw error;
                dm=data;
            }
        );
        return dm;
    },

    csvToJs: async(csv)=>{
        let data = [];
        await csv.forEach(
            (d)=>{
                if(d["geocode"] && d["value"])
                    data[d["geocode"]]=parseFloat(d["value"].replace(",","."));
                else
                    throw "There is something wrong with the csv data. Mandatory column name \"geocode\" and/or \"value\" is missing."
            }
        );
        return data;
    },

    loadAllData: async (selectedDataSource)=>{
        let keys=[];
        await dataLoader.loadDataModel(selectedDataSource).then(
            (dm)=>{
                dataLoader.dataModel=dm;
                keys=dataLoader.getAllKeys(dm);
            }
        );

        let allData=[];
        let dataPromises=[];
        keys.forEach(
            (key)=>{
                const dataPromise = new Promise((resolve, reject) => {
                    dataLoader.loadCSVFile(key).then(
                        (csv)=>{
                            try {
                                // ignore unreaded csv files to avoid error
                                if(typeof csv == "undefined") csv=[];
                                dataLoader.csvToJs(csv).then(
                                    (d)=>{
                                        resolve({key:key,values:d});
                                    }
                                );
                            } catch (error) {
                                reject();
                            }
                        }
                    );
                });
                dataPromises.push(dataPromise);
            }
        );
        await Promise.all(dataPromises).then((d) => {
            allData.push(d);
        });
        return allData;
    },

    getAllKeys: (obj, parentKey)=>{
        let keys = [];
        for(let prop in obj){
            if(Object.prototype.toString.call(obj[prop])=="[object Array]" && obj[prop].length) {
                obj[prop].forEach(element => {
                    keys=keys.concat(dataLoader.getAllKeys(element, obj["key"]));
                });
            }else{
                if (prop=="key") {
                    keys.push((!parentKey?"":parentKey+"-")+obj[prop]);
                }
            }
        }
        return keys;
    },

    getCSVByKey: (key)=>{
        return dataLoader.data[0].find(
            (d)=>{
                if(d.key==key) return d;
            }
        );
    },

    getIndicatorValuebyKeyToSelectedGeom: (key)=>{
        var csv=dataLoader.getCSVByKey(treeview.getSelected().key+"-"+key);
        // get code to selected geom
        let geocode=detail.selectedGeom.gc;
        return (csv && csv.values.length && geocode && csv.values[geocode])?(parseFloat(csv.values[geocode].toFixed(2))):(null);
    }

};