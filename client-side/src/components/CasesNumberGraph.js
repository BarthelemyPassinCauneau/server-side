import { Component, useState } from 'react';
import Select from 'react-select'
import { GraphColumn } from './GraphColumn'
import { GraphCurve } from "./GraphCurve";

import { FetchServerColumnData } from "../lib/FetchServerInputData";
import { Autowired, stringToArray } from 'ag-grid-community';

var pointsCurve = [{x:1, y:1}];
var pointsColumn = [{x:1, y:1}];
var semaineBase = [];
var dep = 0;
var SEM = 21;
var NB_DEP = 95;

const CasesNumberGraph = ({currentDep, mode}) => {
    const [dataColumn, setDataColumn] = useState({ dataBack : [{key: 0}]});
    const [dataCurve, setDataCurve] = useState({ dataBack : [{key: 0}]});
	const [departement, setDepartement] = useState({ defaultDepartement : {value : "00", label : "00"}});
	const [semaine, setSemaine] = useState({ defaultSemaine : {value : SEM.toString(), label : SEM.toString()}});
	var {selectedSem} = semaine.defaultSemaine.value;
	var {selectedDep} = departement.defaultDepartement.value;

    //Set the departement options in the select
	const departementBase = [];
    for(var i = 1; i <= NB_DEP; i++){
        var val = i>9 ? ''+i.toString() : '0'+i.toString()
        departementBase.push({value : val, label: val})
    }

	//Call to the back to get number of cases per age range for a given week and department number
    const callServerColumn = (sem, dep) => {
		let path = "http://localhost:8080/covid_data/heb/dep?week=2020-S"+sem+"&dep="+dep
		FetchServerColumnData(path).then(data => {updateColumnGraph(data)});
	}

	//Call to the back to get total number of cases of all the department for a given week number
    const callServerCurve = () =>{
		pointsCurve = [];
        semaineBase= [];
		dep = departement.defaultDepartement.value;
		let path = "http://localhost:8080/covid_data/heb/dep?dep="+departement.defaultDepartement.value;
        FetchServerColumnData(path).then(data => {updateCurveGraph(data)});
	}

	//Update column graph with promise result
	const updateColumnGraph = (data) => {
		pointsColumn = [];
		for(var i = 0; i<11; i++){  
			if(data[i].cl_age90 != 0 && data[i].cl_age90 != 1 && data[i].cl_age90 != 90){
				pointsColumn.push({ x: (data[i].cl_age90-4), y: data[i].P })
			}
		}
		setDataColumn({dataBack : data})
	}

	//Update curve graph with promise result
	const updateCurveGraph = (data) => {
		data.forEach(element => {
			val = parseInt(element.week.split("S")[1], 10)
			if(element.cl_age90 == 0 && val >= SEM){
				pointsCurve.push({ x: val, y: element.P });
				semaineBase.push({value: val, label: val})
			}
		});
		pointsCurve.sort((a, b)=> a.x - b.x);
		semaineBase.sort((a, b) => a.value - b.label);
		setDataCurve({dataBack : [{key: 0}]});
	}

	//Set the department with the department of the user and do the first request
    if(departement.defaultDepartement.value == "00" && currentDep != 0){
		callServerColumn(SEM, currentDep)
		departement.defaultDepartement.value = currentDep;
		departement.defaultDepartement.label = currentDep;
	}

	//Do a call to the back for column graph when the week select is changed
    const handleChangeSem = defaultSemaine => {
		callServerColumn(defaultSemaine.value, departement.defaultDepartement.value);
		setSemaine({ defaultSemaine });
	};

	//Do a call to the back for column graph when the department select is changed
	const handleChangeDep = defaultDepartement => {
		callServerColumn(semaine.defaultSemaine.value, defaultDepartement.value);
		setDepartement({ defaultDepartement });
	};

	//If the department is changed, update curve graph
    if(dep != departement.defaultDepartement.value){
		callServerCurve();
	}

	//Style of the select to change depending on the theme
    const colourStyles = {
		control: styles => ({ ...styles, backgroundColor: mode ? 'black' : 'white', width:100, marginBottom: 10}),
		option: (styles, { data, isDisabled, isFocused, isSelected }) => {
			return {...styles,
				backgroundColor: isSelected ? "#3f51b5" : isFocused ? "#757de8" : mode ? "black" : "white",
				color: mode ? 'white' : 'black',
				width: 100
			};
		},
		container: styles => ({...styles, width: 100}),
        singleValue: styles => ({...styles, width: 100, color: mode ? 'white' : 'black'})
	};

    return (
		<div >
            <p>Sélectionnez un département</p>
            <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
                <Select styles={colourStyles} options={departementBase} value={selectedDep} onChange={handleChangeDep} defaultValue = {departement.defaultDepartement} />
            </div>  
            <p>Sélectionnez une semaine</p>
            <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>  
                <Select styles={colourStyles} options={semaineBase} value={selectedSem} onChange={handleChangeSem} defaultValue = {semaine.defaultSemaine} />
            </div> 
            <GraphColumn currentDep={departement.defaultDepartement.value} currentSem={semaine.defaultSemaine.value} mode={mode} input={pointsColumn}
                title={"Nombre de cas par tranche d'âge dans le département "+departement.defaultDepartement.value+" lors de la semaine "+semaine.defaultSemaine.value} 
                titleX={"Tranche d'âge"} 
                titleY={"Nb de cas"}/>
			<GraphCurve currentDep={departement.defaultDepartement.value} mode={mode} input={pointsCurve}
                title={"Evolution du nombre de cas par semaine pour le département "+departement.defaultDepartement.value} 
                titleX={"Semaine"} 
                titleY={"Nb de cas"}/>
		</div>
	);
}

export default CasesNumberGraph;
