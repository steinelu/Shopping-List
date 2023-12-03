
class CommandHistory{
	constructor() {
		this.past = []
		this.future = []
	}

	addAndExec(command){
		command.run()
		this.past.push(command)
		this.future = []
	}

	undo(){
		if (this.past.length <= 0)
			return false

		var cmd = this.past.pop()
		cmd.undo()
		this.future.push(cmd)
		return true
	}

	redo(){
		if (this.future.length <= 0)
			return false
		var cmd = this.future.pop()
		cmd.run()
		this.past.push(cmd)
		return true
	}

	createAndExec(execF, undoF){
		this.addAndExec(new Command(execF, undoF))
	}

	clear(){
		this.past = []
		this.future = []
	}

	get undoable(){
		return this.past.length > 0
	}

	get redoable(){
		return this.future.length > 0
	}
}

class Command {
	constructor (execF, undoF){
		this.execF = execF
		this.undoF = undoF
	}

	run(){
		this.execF()
	}

	undo(){
		this.undoF()
	}
}

var commandHistory = new CommandHistory()

document.addEventListener('click', (e) => {
		var item = e.target.closest(".item")
	if (item){
		handleItemClicked(item)
	}
});

function handleItemClicked(target){
	var container = target.parentNode
	var element = target

	if (container.id == "selected") {
		commandHistory.createAndExec(()=>{
			document.getElementById("history").appendChild(element)
		}, ()=>{
			document.getElementById("selected").appendChild(element)
		})
		//document.getElementById("history").appendChild(element)
	}
	else {
		commandHistory.createAndExec(()=>{
			document.getElementById("selected").appendChild(element)
		}, ()=>{
			document.getElementById(container.id).appendChild(element)
		})
		//document.getElementById("selected").appendChild(element)
	}
}




// https://copyprogramming.com/howto/javascript-handle-mouse-hold-event-js-code-example
var timer
function mouseDown(e){
	//console.log("holding")
	if (timer){
		window.clearTimeout(timer)
	}

	timer = window.setTimeout(() => {
		//console.log("timer fired")
		//e.target.closest(".item").classList.add("tobedeleted")

		//document.querySelector("#trash").appendChild(e.target.closest(".item"))

		var id = e.target.closest(".container").id
		console.log(id)
		var node = e.target.closest(".item")

		commandHistory.createAndExec(()=>{
			document.querySelector("#trash").appendChild(node)
		}, ()=>{
			document.querySelector('#' + id).appendChild(node)
		})
	}, 2000)
	//console.log(timer)
}

function mouseUp(e){
	if (timer){
		window.clearTimeout(timer)
		//e.target.closest(".item").classList.remove("tobedeleted")
	}
};


// https://www.telerik.com/blogs/how-to-prevent-cross-site-scripting-xss-javascript
function encodeInput (input) {
	const encoded = document.createElement('div');
	encoded.innerText = input;
	return encoded.innerHTML;
}
// <script>alert('Stored XSS attack!')</script>


function createListItem(text, details, imagename){
	var item = document.createElement("div")
	item.classList.add("item")
	item.addEventListener("mousedown", mouseDown)

	var img = document.createElement("img")
	img.src = imagename
	item.appendChild(img)

	var textelement = document.createElement("p")
	textelement.innerHTML = encodeInput(text)
	textelement.classList.add("name")
	item.appendChild(textelement)

	if(details != undefined){
		var textelement = document.createElement("p")
		textelement.innerHTML = encodeInput(details)
		textelement.classList.add("details")
		item.appendChild(textelement)
	}
	return item
}


function loadImageIndex(){
	return fetch('./availableImages.json', {method:"GET"})
			.then(x => {return x.json()})
}

let imageIndex
(async () => {
	imageIndex = await loadImageIndex();
})();


function queryServerForImage(name){
	return fetch(imagespath, {method:"GET"}).then(x => {return x.body})
}



function search(){
	var node = document.querySelector('input[name="name"]')
	var name = node.value
	if (name.length <= 0) {
		return
	}
	node.value = ""

	node = document.querySelector('input[name="details"]')
	var details = node.value
	node.value = ""

	let imgsrc = "apple0" // default for now
	console.log(imageIndex)
	if (imageIndex.includes(name.toLowerCase())){
		imgsrc = name.toLowerCase()
	}
	
	var child = createListItem(name, details, "images/"+imgsrc+".svg")
	var results = document.querySelector("#results")

	commandHistory.createAndExec(()=>{
		results.appendChild(child)
	}, ()=>{
		results.removeChild(child)
	})
}

function clearHistory() {
	var node = document.querySelector("div#history")
	while(node.firstChild){
		node.firstChild.remove()
	}
}

/* * * *
	Storage - Cache 
* * * */

var storage = window.localStorage

document.addEventListener("DOMContentLoaded", ()=>{
	populateFromStorage()
	document.body.addEventListener("mouseup", mouseUp);
});

function populateFromStorage(){
	var selectedItems = JSON.parse(storage.getItem("selectedItems"))
	var historyItems  = JSON.parse(storage.getItem("historyItems"))
	
	for(let item of selectedItems){
		document.getElementById("selected").appendChild(createListItem(item[0], item[1], item[2]))
	}

	for(let item of historyItems){
		document.getElementById("history").appendChild(createListItem(item[0], item[1], item[2]))
	}
}

function extractItemAndDetails(node){
	//console.log(node)
	var name = node.querySelector('p.name').innerText
	var details = node.querySelector('p.details').innerText
	var imgsrc = node.querySelector('img').src
	return [name, details, imgsrc]
}

function persistToStorage(){
	var sel= []
	for (let child of document.getElementById("selected").children){
		sel.push(extractItemAndDetails(child))
	}

	var his = []
	for (let child of document.getElementById("history").children){
		his.push(extractItemAndDetails(child))
		//his.push(child.querySelector('p[name="name"]').innerText)
	}

	

	storage.setItem("selectedItems", JSON.stringify(sel))
	storage.setItem("historyItems", JSON.stringify(his))
	return storage
}

window.onunload = persistToStorage

