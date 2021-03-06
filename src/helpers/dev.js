/**
 * Tyherox
 *
 * dev
 *
 * Development Test Framework for test case setup.
 *
 */

import React, {Component} from 'react';
import Layout from '../containers/layout/layout.js';
import MenuBar from '../containers/menubar/menuBar.js'
import ReactDOM from 'react-dom';
import Sheet from '../widgets/Sheet/main.js';
import jetpack from 'fs-jetpack';
import merge from 'deepmerge'

export default function(){

    var widgets = [Sheet],
        userData = "dev",
        screenWidth =screen.width,
        screenHeight = screen.height;

    class App extends Component{

        constructor(props){
            super(props);

            if(jetpack.exists(userData+'/state.json')){
                this.state = jetpack.read(userData+'/state.json','json');
            }
            else{
                this.state = {
                    settings: {
                        toolbar: true,
                        findButton: true,
                        sentenceFocusButton: true,
                        widgetOpacity: 100
                    },
                    layout: [
                        {
                        id: 1,
                        refWidth: 4,
                        refHeight:5,
                        refTop: 0,
                        refLeft: 2,
                        state: []
                        }
                    ],
                    savedThemes: [
                    ],
                    savedWidgets: [
                        Sheet
                    ],
                    savedLayouts: [
                    ]
                }
            }

            this.scanUserData = this.scanUserData.bind(this);
            this.readWidgetStorage = this.readWidgetStorage.bind(this);
            this.saveWidgetStorage = this.saveWidgetStorage.bind(this);
            this.deleteWidgetStorage = this.deleteWidgetStorage.bind(this);
            this.renameWidgetStorage = this.renameWidgetStorage.bind(this);
            this.setSettings = this.setSettings.bind(this);
            this.setLayout = this.setLayout.bind(this);
            this.addLayout = this.addLayout.bind(this);
            this.deleteLayout = this.deleteLayout.bind(this);
            this.renameLayout = this.renameLayout.bind(this);
            this.addWidget = this.addWidget.bind(this);
            this.updateWidgetState = this.updateWidgetState.bind(this);
            this.getWidgetState = this.getWidgetState.bind(this);
            this.saveStateToLocal = this.saveStateToLocal.bind(this);
        }

        componentWillMount(){
            this.scanUserData();
        }

        scanUserData(){
           if(jetpack.exists(userData+'/layouts')){
               console.log("SCANNING LAYOUTS");
               var layouts = jetpack.list(userData+'/layouts');
               layouts = layouts.map(function(layout){
                   return({
                       name: layout,
                       data: jetpack.read(userData+'/layouts/'+layout, "json")
                   })
               });
               this.setState({savedLayouts: layouts});
           }

            this.setState({savedWidgets: [Sheet]});
        }

        readWidgetStorage(id, path, fun){

            var widget = this.state.savedWidgets.find(function(elem){
                return elem.id == id;
            });

            path = widget.storage + "/" + path;

            if(jetpack.exists(userData+'/widgets/' + path) && jetpack.inspect(userData+'/widgets/' + path).type == "dir"){
                var data = jetpack.list(userData+'/widgets/' + path);
                if(!fun) return data;
                return data.map(fun);
            }
            else if(jetpack.exists(userData+'/widgets/' + path) && jetpack.inspect(userData+'/widgets/' + path).type == "file"){
                var data = jetpack.read(userData+'/widgets/' + path);
                if(!fun) return data;
                return data.map(fun);
            }
            return false;
        }

        renameWidgetStorage(id, prevName, name){
            var widget = this.findWidgetInSavedWidgets(id);
            jetpack.rename(userData+"/widgets/"+ widget.storage + "/" + prevName, name);
            this.scanUserData();
        }

        deleteWidgetStorage(id, path){
            var widget = this.findWidgetInSavedWidgets(id);console.log("Deleting :" + userData+"/widgets/"+ widget.storage + "/" + path);
            jetpack.remove(userData+"/widgets/"+ widget.storage + "/" + path);
        }

        saveWidgetStorage(id, data, path){
            var widget = this.findWidgetInSavedWidgets(id);
            var json = JSON.stringify(data, null, "\t");
            console.log("SAVING");
            jetpack.write(userData+"/widgets/"+ widget.storage + "/" + path, json);
        }

        setSettings(settingChanges){
            var settings = this.state.settings;
            for(var prop in settingChanges) {
                settings[prop] = settingChanges[prop];
            }
            this.setState({settings:settings},function(){
                this.saveStateToLocal();
            });
        }

        setLayout(layout){
            console.log("SETTING LAYOUT:", layout);
            this.setState({layout: layout}, function(){
                this.saveStateToLocal();
            });
        }

        addLayout(name){
            var layout = JSON.stringify(this.state.layout, null, "\t");
            jetpack.write(userData+"/layouts/"+name+".json",layout);
            console.log("ADDED LAYOUT");
            this.scanUserData();
        }

        deleteLayout(name){
            jetpack.remove(userData+"/layouts/"+name+".json");
            this.scanUserData();
        }

        renameLayout(prevName, name){
            jetpack.rename(userData+"/layouts/"+prevName+".json", name+".json");
            this.scanUserData();
        }

        updateWidgetState(id, state, permanent){

           var widget = this.findWidgetInLayout(id);

            switch(permanent){
                case true:
                    var result = merge(widget, state);
                    var widgets = this.state.layout;
                    widgets.forEach(function(widget){
                        if(id==widget.id) {
                            for(var props in result){
                                widget[props] = result[props];
                            }
                        }
                    });
                    this.setState({layout:widgets}, function(){
                        this.saveStateToLocal();
                    });
                    break;
                default :
                    var result = merge(widget.state, state);
                    var widgets = this.state.layout;
                    widgets.forEach(function(widget){
                        if(id==widget.id) {
                            for(var props in result){
                                widget.state[props] = result[props];
                            }
                        }
                    });
                    this.setState({layout:widgets});
                    break;
            }

        }

        getWidgetState(id, state){
            var widget = this.findWidgetInLayout(id);
            return widget[state];
        }

        findWidgetInLayout(id){
            var widget = this.state.layout.find(function(elem){
                return elem.id == id;
            });
            return widget;
        }

        findWidgetInSavedWidgets(id){
            var widget = this.state.savedWidgets.find(function(elem){
                return elem.id == id;
            });
            return widget;
        }

        saveStateToLocal(){

            var state = JSON.parse(JSON.stringify(this.state));
            state.layout.forEach(function(widget){
               widget.state = [];
            });
            state.savedLayouts = [];
            state.savedThemes = [];
            state.savedWidgets = [];

            //console.log("1:", state, "2:", this.state);

            jetpack.write(userData+"/state.json",state);
        }

        addWidget(widget){
            var layout = this.state.layout;
            layout.push(widget);
            this.setState({layout: layout})
            console.log("STATE:", this.state);
        }

        render(){
            return(
                <div>
                    <MenuBar settings={this.state.settings}
                             setSettings={this.setSettings}
                             layouts={this.state.savedLayouts}
                             addLayout={this.addLayout}
                             setLayout={this.setLayout}
                             deleteLayout={this.deleteLayout}
                             renameLayout={this.renameLayout}
                             addWidget = {this.addWidget}
                             readWidgetStorage = {this.readWidgetStorage}
                             saveWidgetStorage = {this.saveWidgetStorage}
                             widgets = {this.state.savedWidgets}/>

                    <Layout gridCols = '8'
                            gridRows = '5'
                            screenWidth = {screenWidth}
                            screenHeight ={screenHeight}
                            gridHeight = {screenHeight/5}
                            gridWidth = {(screenWidth - 40)/8}
                            cellOffset = {4}
                            settings = {this.state.settings}
                            layout = {this.state.layout}
                            setLayout = {this.setLayout}
                            widgets = {this.state.savedWidgets}
                            getWidgetState = {this.getWidgetState}
                            readWidgetStorage = {this.readWidgetStorage}
                            saveWidgetStorage = {this.saveWidgetStorage}
                            deleteWidgetStorage = {this.deleteWidgetStorage}
                            renameWidgetStorage = {this.renameWidgetStorage}
                            updateWidgetState = {this.updateWidgetState}
                            />
                </div>
            )
        }
    }


    ReactDOM.render(<App/>, document.getElementById('parent'));
};

