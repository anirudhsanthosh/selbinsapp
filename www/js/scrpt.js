const deviceReady = ()=>{
console.log('device ready')
}

function hideLoader(){
	$('.loader').css({left:'-1000px',opacity:0})
}

function showLoader(){
	$('.loader').css({left:'0px',opacity:1})
}

function showModal() {
  var modal = document.querySelector('ons-modal');
  modal.show();
}
function hideModal() {
  var modal = document.querySelector('ons-modal');
  modal.hide();
  
}

function oops(page){

	document.querySelector(page+'>.page__content.page--material__content').classList.add('oops');
}
function removeOops(page){

	document.querySelector(page+'>.page__content.page--material__content').classList.remove('oops');
}

function randomName (){

    return Math.round(Math.random()*10000000)+"_"+Math.round(Math.random()*8547952114);
}


const isJson = (str)=>{
	let result = false;
	try{
		result = JSON.parse(str);
	}catch(e){
		//nothing
	}

	return result;
}
// escaping html 

function escapeHtml(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}
// dealing with local storage




const library = {
	index: 'ALL_FILES',
	url: 'URL',
	getAll : function(){
		// always keep library iterable 
		const data = isJson(localStorage.getItem(this.index));
		if(!data) return [];
		return data;
	},
	getUrls : function(){
		// always keep library iterable 
		const data = isJson(localStorage.getItem(this.url));
		if(!data) return [];
		return data;
	},
	set: function(obj = ''){

		if(typeof obj !== "object" || !obj.url) return false;

		const data = this.getAll();
		const concated = [...data,obj];
		localStorage.setItem(this.index,JSON.stringify(concated));

		const urlData = this.getUrls();
		const urlSoncated = [...urlData,obj.url];
		localStorage.setItem(this.url,JSON.stringify(urlSoncated));

		localStorage.setItem(obj.url,JSON.stringify(obj));
		return concated;
	},
	get: function(item){
		return isJson(localStorage.getItem(item));
	},

	clear:function(){
		localStorage.clear();
	}
}




const player = {
	media: null,
	mediaStatus:0,
	updateSeekerIntervel: null,
	show: function(){
		loadPage('player.html')
	},

	load: async function(file){

		let data;
		let url;
		if(cordova.platformId === "browser"){
			
			try{
					data = await fileTransfer.read(file);
			}catch(e){
				console.log(e)
			}
			const fileData = new Blob([data]);

			url = window.URL.createObjectURL(fileData);
		}else{

			let data;
			try{
					data =  await fileTransfer.getFileEntry(file);;
			}catch(e){
				console.log(e)
			}

			url = data.toInternalURL()
		}

		if(this.media){
			this.media.stop();
		}

		this.media = new Media(url, player.mediaSuccess, player.mediaError,(e)=>{player.mediaStatus = e});

		this.show();
		this.media.play();
	},

	init : function(fileData){

		this.load(fileData.localName);

	},

	mediaSuccess : function(data){
		console.log('success',data);
	},
	mediaError : function(data){
		console.log('error',data);
	},
	
	playPause: function(){
		if(this.mediaStatus == 2) return this.media.pause();

		this.media.play()
	}


}


const fileTransfer = {

	folder: function(){
			   return cordova.platformId === "browser"? cordova.file.dataDirectory
			   :cordova.platformId === "ios"?
			        dataDirectory
			   :
			    cordova.file.applicationStorageDirectory;
	},
	folderEntry: function(){

		if(cordova.platformId !== "browser"){

			return new Promise((resolve,reject)=>{
				window.resolveLocalFileSystemURL(
					this.folder(),
					function(dirEntry){
		            resolve(dirEntry)
				 },
				 (e)=>{
				 	reject(e)
				 })
			})
		}

		return new Promise((resolve,reject)=>{
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
				function (fs) { 
					resolve(fs)
				},
				(e)=>{
					reject(e);
				})
		})
		

	},
	fileEntry: function(folder,file=randomName()){
		console.log(folder);

		if(cordova.platformId === "browser"){
			return new Promise((resolve,reject)=>{
				folder.root.getFile(file,
				 { create: true, exclusive: false },
				  function (fileEntry) {
				  	resolve(fileEntry)
			    }, (e)=>{
			    	reject(e);
			    });
				})
		}

		return new Promise((resolve,reject)=>{
				folder.getFile(file,
				 { create: true, exclusive: false },
				  function (fileEntry) {
				  	resolve(fileEntry)
			    }, (e)=>{
			    	reject(e);
			    });
				})


	},

//.toInternalURL()
	getFileEntry: async function(requestFile = ''){

		return new Promise(async (resolve,reject)=>{

			let  folder;
			try{
				folder = await this.folderEntry();
			}
			catch(e){
				reject(e);
			}
			console.log('inside of get file',folder)
			let file
			try{
				file = requestFile? await this.fileEntry(folder,requestFile) : await this.fileEntry(folder);
			}catch(e){
				reject(e)
			}
			resolve(file);
		})
	},
	createFile: async function(obj,isAppend=false){

			return new Promise(async (resolve,reject)=>{

				if(!obj) reject(new Error('Nothing provided for write'));
				let fileEntry;
				try{
					fileEntry = await this.getFileEntry();
				}catch(e){
					reject(e)
				}

				let result;
				try{
					result = await this.writeFile(fileEntry,obj,isAppend)
				}catch(e){
					reject(e)
				}

				resolve(result);
			})
	},
	writeFile: function(fileEntry,obj = '',isAppend= false){
		return new Promise((resolve,reject)=>{

			if(!obj) reject(new Error('Nothing provided for write'))

			fileEntry.createWriter(function (fileWriter){

		        fileWriter.onwriteend = function() {
		            
		            resolve(fileEntry);
		        };

		        fileWriter.onerror = function (e) {
		            reject(e);
		        };

		        if (isAppend) {
		            try {
		                fileWriter.seek(fileWriter.length);
		            }
		            catch (e) {
		               reject(new Error('file does not exist!'))
		            }
		        }

		        fileWriter.write(obj);
	    	});
		})
	},

	read: function(file){

		return new Promise(async (resolve,reject)=>{
			if(!file) reject(new Error('no file mentnd'));
			let folder;
			try{
				folder = await this.folderEntry();
			}catch(e){
				reject(e)
			}
			let fileEntry ;
			try{
				fileEntry = await this.fileEntry(folder,file);
			}catch(e){
				reject(e);
			}

			fileEntry.file(async (file)=>{ // <- this file is file reolve
				const reader = new FileReader();
				reader.onload = function(e) {
            		resolve(e.target.result)
        		};
        		reader.readAsArrayBuffer(file);
			},(e)=>{
				reject(e);
			})
		})
	}

}



// fgile transfer clas end






async function  aa(){

	const obj = new Blob(['sdsdsds dd dsds d']);
	let res;
	try{
		res = await fileTransfer.createFile(obj)
	}
	catch(e){
		console.log('from aa()',e)
	}

	console.log(res);
}

async function bb(){
	//const file = 'http_127.0.0.1_3000:Persistent/9371868_8026942355';
	const file = '6230635_8275954085';

	let data;
	try{
			data = await fileTransfer.read(file);
	}catch(e){
		console.log(e)
	}
	const dd = new Blob([data]);

	const url = window.URL.createObjectURL(dd);

	console.log(url);

	let my_media = new Media(url, e=>{console.log(e)}, console.log);
	console.log(my_media)
	my_media.play();
}



// requsting files from server
 function fetchFilesMeta(){

	return new Promise(async (resolve,reject)=>{

		let response;
		try{
			 response = await fetch('http://bestwishess.online/safari/download.php', [])
		}catch(e){
			console.log(e.message);
		}


		if (response.ok) {
			let result;
			try{
	  		 	result = await response.json();
			}catch(e){
				console.log(e.message)
			}

	  		if(result.status !== "success" ){
		  		reject(new Error('failed'));
	  		}

	  		if(result.files.length == 0){
	  			
		  		reject(new Error('failed'));
	  		}

	  		resolve( result.files);
		} else {
		  reject(new Error('failed'));
		}

	})
		
}

 function fetchFilepreview(url = ""){

	return new Promise(async(resolve,reject)=>{


			if(!url || typeof url !== "string"){
				reject(new Error('Invalid url'));
			}

			let response;
			try{
				 response = await fetch(url, [])
			}catch(e){
				console.log(e.message);
			}

			if (response.ok) {
				let result;
				try{
		  		 	result = await response.json();
				}catch(e){
					console.log(e.message)
				}

		  		if(result.status !== "success" ){
			  		reject(new Error('failed'));
		  		}
		  		resolve( result);
			} else {
			  reject(new Error('failed'));
			}

	})

}

function createDisplayCard(file,saved=false){

if(!file || typeof file !== "object") return false;

card = `<ons-card class="h-100">
    <div class="content">
    	<div class="download-container d-flex justify-content-center mb-2">

    	${
    		(!saved) ? (`<div class="download ">
	    		<ons-progress-circular value="0" secondary-value="100" class="download-progress "></ons-progress-circular>


	    		<small class="download-percentage d-flex justify-content-center align-items-center ">0%</small>



	    		<span class="download-icon d-flex justify-content-center align-items-center" data-file="${escapeHtml(JSON.stringify(file))}">
	    			<ons-icon icon="md-download"></ons-icon>
	    			<small>
     					${file.size}
     				</small>
	    		</span>
	    	</div>`)

	    	: (`
	    			<div class="play-container d-flex justify-content-center mb-2">
		    			<span class="play-icon d-flex justify-content-center align-items-center" data-file="${escapeHtml(JSON.stringify(file))}">
		    				<ons-icon icon="md-play"></ons-icon>
		    			</span>
	    			</div>

	    		`)

	    }

    	</div>
    	<div class="text-capitalize title text-white text-center file-name">
    		${file.name}
    	</div>
    </div>
  </ons-card>`;




  return card;


}

function createDownloader(){

	console.log('click')
	if(this.className.includes('clicked')) return;
	console.log('pass')
	new downloader(this);
}

//className.includes('button')
class downloader{

	constructor(button) {
    	button.classList.add('clicked');
    	this.file = isJson(button.getAttribute('data-file'));
    	this.url = this.file.url;
    	this.progress = button.parentElement.querySelector('ons-progress-circular');
    	this.percentage = button.parentElement.querySelector('.download-percentage');
    	this.button = button;
    	this.col = button.parentElement.parentElement.parentElement.parentElement.parentElement;
    	this.animate();
    	this.loader();
  	}

  	animate(){
  		this.button.style.opacity = 0;
  		this.progress.style.opacity = 1;
  		this.progress.style.transitionDuration = '0s';

  		this.progress.setAttribute('indeterminate');
  		this.percentage.style.opacity = 1;
  	}

  	animateBack(){
  		this.button.classList.remove('clicked');
  		this.button.style.opacity = 1;
  		this.progress.style.opacity = 0;
  		this.progress.style.transitionDuration = '0.8s';
  		this.percentage.style.opacity = 0;
  		this.percentage.textContent = '0%';
  		this.progress.setAttribute('value',0);

  	}

  	removeCard(){
  		this.col.remove();
  		// const count = document.querySelector('#new-downloads').getAttribute('badge');
  		// document.querySelector('#new-downloads').setAttribute('badge',Number(count)-1);
		const count = document.querySelector('#new-downloads').querySelector('.notification').innerHTML;
		document.querySelector('#new-downloads').querySelector('.notification').innerHTML =  Number(count)-1;

  		const newFiles = document.querySelector('#new-saved-files-tab').getAttribute('badge');
  		document.querySelector('#new-saved-files-tab').setAttribute('badge',Number(newFiles)+1);
  		removeOops('#saved')
  	}

  	addToSaved(){

  		const card = createDisplayCard(this.file,true)
  		const row = document.createElement('ons-row');
  		const col = document.createElement('ons-col');
  		col.innerHTML = card;
  		col.querySelector('.play-icon').onclick = ()=> player.init(this.file);
  		row.appendChild(col);
  		document.querySelector('#saved-file-list').appendChild(row);



  	}

  	async loader(){

  		//let response = await fetch(this.url);

  		const proxyurl = "https://cors-anywhere.herokuapp.com/";
  		let response
  		// Step 1: start the fetch and obtain a reader
  		try{
		 response = await fetch(proxyurl+this.url);
  		}
  		catch(e){
  			ons.notification.toast('Sorry Unable to complete download, Try again.',{ timeout: 3000, animation: 'fall' });
  			this.animateBack();
  			return;
  		}
		

		const reader = response.body.getReader();

		// Step 2: get total length
		const contentLength = +response.headers.get('Content-Length');

		// Step 3: read the data
		let receivedLength = 0; // received that many bytes at the moment
		let chunks = []; // array of received binary chunks (comprises the body)
		this.progress.removeAttribute('indeterminate')
		while(true) {
		  const {done, value} = await reader.read();

		  if (done) {
		    break;
		  }

		  chunks.push(value);
		  receivedLength += value.length;
			
			let compleated = Math.round(receivedLength/contentLength*100);

			this.percentage.textContent = compleated+'%';

			this.progress.setAttribute('value',compleated);
		  console.log(`Received ${receivedLength} of ${contentLength}`)

		}

		if(receivedLength !== contentLength) {
			ons.notification.toast('Sorry Unable to complete download, Try again.',{ timeout: 3000, animation: 'fall' });
  			this.animateBack();
			return;

		}

		let blob = new Blob(chunks);

		let res;

		try{
			res = await fileTransfer.createFile(blob)
		}
		catch(e){

			console.log(e);
			ons.notification.toast('Sorry Unable to complete download, Try again.'+e.message,{ timeout: 3000, animation: 'fall' });
  			this.animateBack();
			return;
		}

		this.file.localName = res.name;
		library.set(this.file);
		this.removeCard();
		this.addToSaved();


		// let audio = new window.Audio();
		// audio.src = window.URL.createObjectURL(blob);
		// audio.play();
  	}




}







async function  generateThumpnail(){
	let files;
	try{
			files = await fetchFilesMeta();
	}catch(e){
		console.log(e)
	}

	

	if(!files){
		ons.notification.toast('Unable to contact with server !');
		hideModal()
		oops('#new');
		
		return;
	}



	const metadatasPromis = await files.map(async (file)=>{
		if(!file.meta) return false;
		let fileData;
		try{
			fileData = await fetchFilepreview(file.meta);
		}catch(e){
			console.log(e)
		}

		return fileData
	})

	
	// const metaDatas = await  Promise.allSettled(metadatasPromis);
	// const availableFiles = metaDatas.filter((data)=> data.status === "fulfilled" && data.value);
	// const notDownloaded = availableFiles.filter((data)=> !library.get(data.value.url)	);

	// if(notDownloaded.length !== 0 ) document.querySelector('#new-downloads').setAttribute('badge',notDownloaded.length);
	// const cards = notDownloaded.map((file)=>{
	// 	return createDisplayCard(file.value);
	// })

	metadatasPromis.map(p => p.catch(e => e));
	const metaDatas = await  Promise.all(metadatasPromis);

	const availableFiles = metaDatas.filter((data)=> typeof data === "object" && data.status === "success");
	const notDownloaded = availableFiles.filter((data)=> !library.get(data.url)	);
	if(notDownloaded.length !== 0 ) document.querySelector('#new-downloads').setAttribute('badge',notDownloaded.length);
	const cards = notDownloaded.map((file)=>{
		return createDisplayCard(file);
	})





	cards.map((card,index)=>{
		if(!card) return;
		const col = document.createElement('ons-col');
		col.innerHTML = card;

		col.querySelector('.download-icon').onclick = createDownloader;
		

		if((index+1)%2){
			const row = document.createElement('ons-row');
			row.classList.add('mb-2');
			row.appendChild(col)
			document.getElementById('file-list').appendChild(row)
			return;
		}

		// if second card append to previous row
		document.getElementById('file-list').lastChild.appendChild(col);	

	})

	hideModal()
}



function showSavedFiles(){

	console.log('callsed')
	const savedFiles = library.getAll();
	if(!savedFiles.length) return oops('#saved');

	savedFiles.map((file)=>{
		const card = createDisplayCard(file,true);
		const row = document.createElement('ons-row');
  		const col = document.createElement('ons-col');
  		col.innerHTML = card;
  		col.querySelector('.play-icon').onclick = ()=> player.init(file);
  		row.appendChild(col);
  		document.querySelector('#saved-file-list').appendChild(row);
	})
}






// events

ons.ready(()=>{

console.log('ons ready')
//remove loader
 hideLoader()
// backbutton exit
ons.enableDeviceBackButtonHandler();

// lock portriatemode
window.screen.orientation.lock('portrait');

// Set a new handler
ons.setDefaultDeviceBackButtonListener(function(event) {
  ons.notification.confirm('Do you want to close the app?') // Ask for confirmation
    .then(function(index) {
      if (index === 1) { // OK button
        navigator.app.exitApp(); // Close the app
      }
    });
});

})



document.addEventListener('init', function(event) {
  if (event.target.matches('#home')) {
   	
  }
  

}, false);




document.addEventListener('deviceready',deviceReady , false);