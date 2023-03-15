//all parameters tested
/*
var windowSizes=[60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240]; //19
var pearsonThresholds=[0.86,0.87,0.88,0.89,0.90,0.91,0.92,0.93,0.94,0.95,0.96,0.97,0.98,0.99]; //12
var shiftingWindow=[0,6,12,18,24]; //0,24
*/



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

//shifting does not make sense for calculating false positives

let parameters=[];

var startx = 0,
    starty = 0,
    endx = windowSizes.length-1,
    endy = pearsonThresholds.length-1;
	
	

for (; startx <= endx; startx++) {
    for (starty = 0; starty <= endy; starty++) {
		parameters.push({pearson: pearsonThresholds[starty], wSize:windowSizes[startx]})

    }
}


let initialWindowSize, pearsonThreshold, windowSize;


initialWindowSize = parameters[parametersIndex].wSize;
pearsonThreshold = parameters[parametersIndex].pearson;
windowSize=initialWindowSize;

let fileToProcess=0;
var isNumber = function isNumber(value) {
   return typeof value === 'number' && isFinite(value);
}



function slidingWindow(arr, size) {

  let index = 0;
  let end = size;
  

  return function() {
    if (end > arr.length) {
      return null;
    }
    

    const window = arr.slice(index, end);
    

    index += windowStep;
    end += windowStep;
	windowStep=1;
    
    return window;
  };
}
  
  
  function pearsonCorrelation(arr, key1, key2) {
	  

  let sum1 = 0;
  let sum2 = 0;
  let sum1Squared = 0;
  let sum2Squared = 0;
  let sumProduct = 0;
  let n = arr.length;
  

  
  for (let i = 0; i < n; i++) {
	
    const obj1 = arr[i];
	const obj2 = arr[i];
    const val1 = parseFloat(obj1[key1]);
    const val2 = parseFloat(obj2[key2]);
    
    sum1 += val1;
    sum2 += val2;
    sum1Squared += val1 ** 2;
    sum2Squared += val2 ** 2;
    sumProduct += val1 * val2;
  }
  
  const mean1 = sum1 / n;
  const mean2 = sum2 / n;
  const std1 = Math.sqrt(sum1Squared / n - mean1 ** 2);
  const std2 = Math.sqrt(sum2Squared / n - mean2 ** 2);
  

  const covariance = sumProduct / n - mean1 * mean2;
  const correlation = covariance / (std1 * std2);
  
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
	
var windowStep = 1;
let numberCorrectActivation=0;
var orbitDegrees=[0,120,180,240];

function processFile(fileToProcess) {

	  
	var reader = new FileReader();
    reader.onload = function() {
			  
			
            var csv = reader.result;
            var data = Papa.parse(csv, {header: true}).data;
			//console.log(data);
			
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
			
			
			
			var cond=data[0].cond;
			
			//var truePositiveOrbitDegree=cond.split("-")[1];
			//console.log(cond,truePositiveOrbitDegree);
			

			orbitDegrees.forEach((degree) => {

				var fp=0;
				const slide = slidingWindow(data, windowSize);
				let window = slide();
				while (window && window.length === windowSize) {
					//console.log(window);
					window = slide();
					
					if (window!=null){

						
							
							let corrFP=Math.max(pearsonCorrelation(window, "eyex", "orb-"+degree+"deg-x"), pearsonCorrelation(window, "eyey", "orb-"+degree+"deg-y"));
							if (isNumber(corrFP)){
								if (corrFP>pearsonThreshold){
									parametersData.push([data[0].age,data[0].gender,data[0].musicexperience,data[0].cond,initialWindowSize,pearsonThreshold,degree,1]);
									
									fp++;
									windowStep=windowStep+initialWindowSize;
								}
							}  
							
						
						
						
					}
				}
				console.log([initialWindowSize,pearsonThreshold,degree,fp]);
				
			});
			

	
	
		//numberCorrectActivation=0;
		
		
		fileToProcess++;
		
		processFile(fileToProcess);
    };
    
	if (files[fileToProcess]){
		//console.log(files[fileToProcess]);
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
	
	console.log("parameters",parameters[parametersIndex]);
	
	if (parameters[parametersIndex]){
		initialWindowSize = parameters[parametersIndex].wSize;
		pearsonThreshold = parameters[parametersIndex].pearson;
		windowSize=initialWindowSize+shifting;
		fileToProcess=0;
		processFile(fileToProcess);
	} else {
		console.log("end");
		downloadCsvFrom2DArray(parametersData, "parametersData");
	}
	
}