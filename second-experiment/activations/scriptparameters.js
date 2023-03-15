//all parameters tested
/*
var windowSizes=[60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240]; //19
var pearsonThresholds=[0.86,0.87,0.88,0.89,0.90,0.91,0.92,0.93,0.94,0.95,0.96,0.97,0.98,0.99]; //12
var shiftingWindow=[0,6,12,18,24]; //5
*/



//optimal shifting value
var shiftingWindow=[18]; 

//optimal parameters for 1 orbit, 3.6s
/*
var windowSizes=[100]; 
var pearsonThresholds=[0.98]; 
*/

//optimal parameters for 2 orbit, 3.6s
/*
var windowSizes=[70]; 
var pearsonThresholds=[0.99]; 
*/

//optimal parameters for 3 orbit, 3.6s

var windowSizes=[60]; 
var pearsonThresholds=[0.99]; 


let parametersIndex=0;

let parameters=[];

var startx = 0,
    starty = 0,
	startz = 0,
    endx = shiftingWindow.length-1,
    endy = pearsonThresholds.length-1;
	endz = windowSizes.length-1;
	
	

for (; startx <= endx; startx++) {
    for (starty = 0; starty <= endy; starty++) {
		for (startz = 0; startz <= endz; startz++) {
			parameters.push({pearson: pearsonThresholds[starty], wSize:windowSizes[startz], shiftingW:shiftingWindow[startx]})
		}
		//parameters.push({pearson: pearsonThresholds[starty], wSize:windowSizes[startx]});
    }
}


let initialWindowSize, pearsonThreshold, windowSize, shifting;


initialWindowSize = parameters[parametersIndex].wSize;
pearsonThreshold = parameters[parametersIndex].pearson;
shifting=shiftingWindow[parametersIndex];
//shifting=0;
windowSize=initialWindowSize;

let fileToProcess=0;
var isNumber = function isNumber(value) {
   return typeof value === 'number' && isFinite(value);
}
 

function slidingWindow(arr, size, step) {

  let index = 0;
  let end = size;
  

  return function() {

    if (end > arr.length) {
      return null; 
    }
    

    const window = arr.slice(index, end);
    

    index += step;
    end += step;
    
    return window;
  };
}
  

function pearsonCorrelation(arr1, key1, arr2, key2) {
	
  arr1 = arr1.map(obj => ({...obj, [key1]: parseFloat(obj[key1])}));
  arr2 = arr2.map(obj => ({...obj, [key2]: parseFloat(obj[key2])}));

  const avg1 = arr1.reduce((acc, val) => acc + val[key1], 0) / arr1.length;

  const avg2 = arr2.reduce((acc, val) => acc + val[key2], 0) / arr2.length;


  let covariance = 0;
  for (let i = 0; i < arr1.length; i++) {
    covariance += (arr1[i][key1] - avg1) * (arr2[i][key2] - avg2);
  }
  covariance /= arr1.length;


  let stdDev1 = 0;
  let stdDev2 = 0;
  for (let i = 0; i < arr1.length; i++) {
    stdDev1 += Math.pow(arr1[i][key1] - avg1, 2);
  }
  stdDev1 = Math.sqrt(stdDev1 / arr1.length);

  for (let i = 0; i < arr2.length; i++) {
    stdDev2 += Math.pow(arr2[i][key2] - avg2, 2);
  }
  stdDev2 = Math.sqrt(stdDev2 / arr2.length);


  const correlation = covariance / (stdDev1 * stdDev2);

  return correlation;
}






let files;
  
$(document).ready(function() {
      var dropzone = document.getElementById('dropzone');
      dropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
      });
      dropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        files = e.dataTransfer.files;
		
		processFile(fileToProcess);

      });
});

function duplicateArray(array) {
  const newArray = [];
  for (let i = 0; i < array.length; i++) {
    const objectCopy = {};
    for (const [key, value] of Object.entries(array[i])) {
      objectCopy[key] = value;
    }
    newArray.push(objectCopy);
  }
  return newArray;
}

var data1;
var data2;

let numberCorrectActivation=0;
function processFile(fileToProcess) {
	//console.log(fileToProcess);
	  
	var reader = new FileReader();
    reader.onload = function() {
			  
			
            var csv = reader.result;
			
            var data = Papa.parse(csv, {header: true}).data;
			
			
			for (let i = 0; i < data.length-1; i++) {
				if (data[i]['orb-0deg-x'] == data[i+1]['orb-0deg-x'] 
				&& data[i]['orb-0deg-y'] == data[i+1]['orb-0deg-y']
				&& data[i]['orb-120deg-x'] == data[i+1]['orb-120deg-x']
				&& data[i]['orb-120deg-y'] == data[i+1]['orb-120deg-y']
				&& data[i]['orb-180deg-x'] == data[i+1]['orb-180deg-x']
				&& data[i]['orb-180deg-y'] == data[i+1]['orb-180deg-y']
				&& data[i]['orb-240deg-x'] == data[i+1]['orb-240deg-x']
				&& data[i]['orb-240deg-y'] == data[i+1]['orb-240deg-y']){
					delete data[i];
				}
			}
			
			data = data.filter(function( element ) {
				return element !== undefined;
			});
			data.pop(); //remove last item that is void
			
			let dataeye=duplicateArray(data);
			//console.log(data,"copy",  dataeye);
			
			
			dataeye.splice(0, shifting); //remove first elements of array by shifting value
			data.splice(-shifting, shifting); //remove last elements of array by shifting value
			//data and data eye remain of the same size
			
			
			//console.log(data);
			//console.log("total time", parseInt(parseInt(data[data.length-1].jstimestamp) - parseInt(data[0].jstimestamp)));
			//return;
			
			
			
			var cond=data[0].cond;
			
			var truePositiveOrbitDegree=cond.split("-")[1];
			//console.log(cond,truePositiveOrbitDegree);
			
			const windowStep = 1;
			const slide = slidingWindow(data, windowSize, windowStep);
			const slideeye = slidingWindow(dataeye, windowSize, windowStep);
			
			
			
			let window = slide();
			let windoweye = slideeye();
			//console.log(window, windoweye);
			
			
			let correctActivation=false;
			let activationError=false;
			let correctActivationTime=0;
			while (window && window.length === windowSize) {
			  //console.log(window);
			  window = slide();
			  windoweye = slideeye();
			  if (window!=null){
				
				let corrTruePositive=Math.max(pearsonCorrelation(windoweye, "eyex", window, "orb-"+truePositiveOrbitDegree+"deg-x"), pearsonCorrelation(windoweye, "eyey",window, "orb-"+truePositiveOrbitDegree+"deg-y"));
				//console.log(corrTruePositive);
				if (isNumber(corrTruePositive)){
					if (corrTruePositive>pearsonThreshold){
						//console.log(corrTruePositive);
						correctActivation=true;
						correctActivationTime=windoweye[windoweye.length-1].pythontimestamp - data[0].pythontimestamp; //consider windoweye (which is shifted) to calculate activation times more precisely
						break;
					}
				}  
				  
				if (cond.startsWith("2")){
					
					let orbitError;
					if (truePositiveOrbitDegree=="0"){
						orbitError="180";
					} else if (truePositiveOrbitDegree=="180"){
						orbitError="0";
					}
					let corrError=Math.max(pearsonCorrelation(windoweye, "eyex", window, "orb-"+orbitError+"deg-x"), pearsonCorrelation(windoweye, "eyex", window, "orb-"+orbitError+"deg-y"));
					if (isNumber(corrError)){
						if (corrError>pearsonThreshold){
							activationError=orbitError+"deg";	
							break;
						}
					}  
					
				} else if (cond.startsWith("3")){
					
					let orbitError1;
					let orbitError2;
					if (truePositiveOrbitDegree=="0"){
						orbitError1="120";
						orbitError2="240";
					} else if (truePositiveOrbitDegree=="120"){
						orbitError1="0";
						orbitError2="240";
					} else if (truePositiveOrbitDegree=="240"){
						orbitError1="0";
						orbitError2="120";
					}
					//console.log(orbitError1, orbitError2);
					let corrError1=Math.max(pearsonCorrelation(windoweye, "eyex", window, "orb-"+orbitError1+"deg-x"), pearsonCorrelation(windoweye, "eyex", window, "orb-"+orbitError1+"deg-y"));
					if (isNumber(corrError1)){
						if (corrError1>pearsonThreshold){
							activationError=orbitError1+"deg";
							break;
						}
					}  
					
					let corrError2=Math.max(pearsonCorrelation(windoweye, "eyex", window, "orb-"+orbitError2+"deg-x"), pearsonCorrelation(windoweye, "eyex", window, "orb-"+orbitError2+"deg-y"));
					if (isNumber(corrError2)){
						if (corrError2>pearsonThreshold){
							activationError=orbitError2+"deg";	
							break;
						}
					}  
					
				}
			  }
			}
			let result="";
			if (correctActivation){
				//console.log(cond+":", "correct("+correctActivationTime+"ms)");
				result="correct("+correctActivationTime+"ms)";
			} else if (activationError){
				//console.log(cond+":", "error("+activationError+")");
				result="error("+activationError+")";
			} else {
				//console.log(cond+":", "missed");ç
				result="missed";
			}
			

	
	//console.log(			[data[0].age, data[0].gender, data[0].musicexperience, data[0].cond, initialWindowSize, pearsonThreshold, result, files[fileToProcess].name]);
	console.log(			[data[0].age, data[0].gender, data[0].musicexperience, data[0].cond, initialWindowSize, pearsonThreshold, result, shifting]);
	
	parametersData.push(	[data[0].age, data[0].gender, data[0].musicexperience, data[0].cond, initialWindowSize, pearsonThreshold, result, shifting, btoa(data[0].age+data[0].gender+data[0].musicexperience)]);
	//numberCorrectActivation=0;
	
	
	fileToProcess++;
	
	processFile(fileToProcess);
    };
    
	if (files[fileToProcess]){
		reader.readAsText(files[fileToProcess]);
	} else {
		nextParameters();
	}
	
}

parametersData=[];

function downloadCsvFrom2DArray(array2D, fileName) {
  const csv = array2D.map(row => row.join(';')).join('\n');
  const csvData = new Blob([csv], {type: 'text/csv'});
  const csvUrl = URL.createObjectURL(csvData);
  const link = document.createElement('a');
  link.href = csvUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function nextParameters(){
	//console.log(parametersData[parametersData.length-1]);
	
	parametersIndex++;
	
	
	
	if (parameters[parametersIndex]){
		initialWindowSize = parameters[parametersIndex].wSize;
		pearsonThreshold = parameters[parametersIndex].pearson;
		shifting=parameters[parametersIndex].shiftingW;
		//shifting=0;
		windowSize=initialWindowSize;
		fileToProcess=0;
		processFile(fileToProcess);
	} else {
		console.log("end");
		downloadCsvFrom2DArray(parametersData, "parametersData");
	}
	
}