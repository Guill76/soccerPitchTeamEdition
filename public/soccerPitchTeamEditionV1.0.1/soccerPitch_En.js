var objects=[];

//Directions possibles
const up=0;
const down=1;

//Type de terrain
const halfPitch=0;
const fullPitch=1;


//type de rayures 
const vertical=0;
const horizontal=1;
const oblic45=2;
const oblic135=3;
//type deduit si 2 equipes sont definis
//type calculé dependance :si nombre d'equipes = 2 
const doubleTeamPitch=2;

 
function team (props) {
	if( Object.prototype.toString.call( props ) === '[object Object]' ) {
		this.direction=parseInt(props.direction);
		this.teamColor=props.teamColor;
		this.teamColorB=props.teamColorB;
		this.stripesType=parseInt(props.stripesType);
		this.numberOfStripes=parseInt(props.numberOfStripes);
		this.textColor=props.textColor;
		this.players=[];
		
	}
}

function soccerPitch (props) {
	// La liste de proprietes modifiables est stockee
	// dans defaultUserProperties.
	// defaultUserProperties sert egalement
	// de template pour controler
	// les parametres utilisateur
	this.defaultUserProperties={
				id: '_sp_canvas_id_def',					// l'id de l'element canvas utilisateur (val par def: _sp_canvas_id_def)
				renderImgId:'_sp_img_id_def',				// l'id de l'image utilisateur pour le rendu (val par defaut: _sp_img_id_def)
				width: 250,               					//Largeur de l'image representant le terrain (en pixels)
				rateHW: 1.5,              					//rapport Hauteur(Longueur)/largeur du terrain
															//==> hauteur=width*rateHW
				widthIRL:60,              					//Largeur standard et reelle du terrain en m 
															//==> permet de recreer l'echelle
				iconesFiles:{
						ball:'img/but_12x12px.png',
						yellowCard:'img/Carton_jaune_9x12px.png',
						redCard:'img/carton_rouge_9x12px.png'
						},											
				playerSize:14,								//Taille des joueurs en px			 
				lineWidth: 2,             					//Epaisseur des traits en px
				grassColor1: "#088A08" ,  					//couleur de tonte 1 "#088A08"
				grassColor2: "#04B404",   					//couleur de tonte 2 "#04B404"
															
				shadow: true,           					//Ombre des joueurs: true ou false
				textStyle: "Bold italic",  	                //style texte incrusté(nom)
				top:{x: 20,y:20},         					//permet de dessiner un cadre exterieur : 0,0 pour supprimer le cadre
				cornerRadius:1,		  	  					//rayon des quarts de cercle du pt de corner en metres
				//direction:up, 							//orientation du 1/2 terrain important si aucune equipe (aucun interet sinon calculé)
															//Types possibles de representation:
				type: fullPitch,						    //halfPitch		  :  1 demi-terrain, 
															//fullPitch :  1 grand terrain 
				teams: [new team({direction: up,			//ajout de 2 equipes sur le terrain
								teamColor: "#0000FF",
								teamColorB:"#FF0000",		//couleurs rayures (couleurs identiques==> pas de rayures)
								stripesType: vertical,         //rayure Verticales
								numberOfStripes:5,
								textColor: "#FFFFFF"}), 
						new team({direction: down,
								teamColor: "#FFFFFF",
								teamColorB:"#FFFFFF",		//couleurs rayures
								stripesType: horizontal,       //rayure Verticales
								numberOfStripes:4,
								textColor: "#000000"})],
				configMenu: true,							// par defaut on gere le parametrage via menu si ce flag est actif
				help: true,									//affichage du bouton aide ==> non implemente pour le moment gere dans configMenu
				grassStripesNumber:11						//Nombre de bandes sur la pelouse( degradé de couleurs)
				
				};
				
	//On cree certains elements requis si besoin			
	this.buildBottomMenu = function () {
		var par_elt, new_elt;
		var obj=this;
		par_elt=document.getElementById(this.id).parentNode;
		new_elt=document.createElement('div');
		new_elt.innerHTML=this.htmlBottomMenu;
		par_elt.appendChild(new_elt);
		document.getElementById("_sp_inputSub_configMenu").addEventListener("click",function () { obj.showConfigMenu();});
		document.getElementById("_sp_inputSub_help").addEventListener("click",function () { obj.showHelp();});
		document.getElementById("_sp_inputSub_DataURL").addEventListener("click",function() { obj.toDataUrl();} );
		document.getElementById("_sp_inputSub_drgDrp").addEventListener("click",function() { obj.switchModeDragNDrop();} );
	}
	
	//Installer les elements Canvas ouImages ou autres si il n'existent pas
	this.checkInstallRequired = function(eltId,domEltType){
		var elt;
		if (!document.getElementById(eltId))  {
			elt=document.createElement(domEltType);
			if (elt){
				elt.id=eltId;
				document.getElementsByTagName('BODY')[0].appendChild(elt);
				console.log('Elt '+eltId + ' de Type '+domEltType+' installé' );
			} else {
				console.log('ERR: Elt '+eltId + ' de Type '+domEltType+'non installé' );
			}
		}
	}
	//Permettre de recalculer les positions des joueurs si modification 
	// de la taille du terrain en pixel
	this.refreshCoordsPixels = function () {
		if (this.teams){
			if(this.teams.length>0){
				if (this.teams[up])	{
					for (var i=0;i<this.teams[up].players.length;i++){
						this.teams[up].players[i].x=Math.round(this.teams[up].players[i].meterX*(this.width/this.widthIRL)+this.topX);
						if (this.type!=halfPitch)
							this.teams[up].players[i].y=Math.round(this.teams[up].players[i].meterY*(this.width/this.widthIRL)+this.topY);
						else 
							this.teams[up].players[i].y=Math.round(this.teams[up].players[i].meterY*(this.width/this.widthIRL));
					}
				}
				if (this.teams[down]){
					for (var i=0;i<this.teams[down].players.length;i++){
						this.teams[down].players[i].x=Math.round(this.teams[down].players[i].meterX*(this.width/this.widthIRL)+this.topX);
						this.teams[down].players[i].y=Math.round(this.teams[down].players[i].meterY*(this.width/this.widthIRL)+this.topY);
					}
				}
			}			
		}
	}
	
		
	//Initialisiation dans ou hors du coonstructeur:
	//Method appelée 1 à plusieurs fois : a la construction ou a la maj de parametres)
	this.setProperties = function (props) {
		var indiceFound = -1;
		var size;
		if( Object.prototype.toString.call( props ) === '[object Object]' ) {
			
			//si 1 propriete non definie =>recuperation de celle par defaut 
			for ( var propName in this.defaultUserProperties){
				if (!Object.prototype.hasOwnProperty.call(props,propName)) {
					console.log('Propriete '+propName+' n\' est pas definie, recuperation de la valeur par defaut');
					props[propName]=this.defaultUserProperties[propName];
				}
			}
			
			//
			this.width = parseInt(props.width);
			this.rateHW = parseFloat(props.rateHW);
			this.height= parseInt(this.width*this.rateHW);
			this.widthIRL = parseInt(props.widthIRL);
			this.grassColor1 = props.grassColor1;
			this.grassColor2 = props.grassColor2;
			this.playerSize = parseInt(props.playerSize/2); //Radius=Diameter/2
			this.sqrDistBtwPl = Math.round(3 * this.width / this.widthIRL);
			this.sqrDistBtwPl *= Math.round(3 * this.width / this.widthIRL);
			this.iconesFiles = props.iconesFiles;
			this.textStyle = props.textStyle;
			this.shadow = props.shadow;
			this.lineWidth = parseInt(props.lineWidth);
			this.cornerRadius = parseInt(props.cornerRadius);
			this.id = props.id;
			this.checkInstallRequired(this.id,'canvas');
			this.type=parseInt(props.type);
			this.direction=parseInt(props.direction);
			this.topX = parseInt(props.top.x);
			this.isDragNDropActive=false;
			this.topY = parseInt(props.top.y);
			this.grassStripesNumber= parseInt(props.grassStripesNumber);
			this.renderImgId = props.renderImgId;
			this.offsetLeft=findXY(this.id).x;
			this.offsetTop=findXY(this.id).y;
			
			this.teams=[];
			if ( props.teams ) {
				//recalcul du type et de la direction lorsqu'elles sont implicitement contenu dans les propriétés de l'equipe
				if (props.teams.length==2) this.type = doubleTeamPitch;
				if (this.type==halfPitch || this.type != doubleTeamPitch) this.direction = props.teams[0].direction;	
				
				//on force les indices du tableau 
				//à correspondre à la direction 0:up et 1:down
				//car on ne peut pas avoir plus de 2 equipes
				for (var i=0; i < props.teams.length ; i++){
					if ( props.teams[i].direction == up )
						this.teams[up]=props.teams[i];
					else 
						this.teams[down]=props.teams[i];
				}
				
			}
			this.configMenu=props.configMenu;
			this.help=props.help;
			
			
			this.refreshCoordsPixels();
			this.inputTxt = null;	
			this.helpElt = null;
			this.lastProperties=props;
			
			//Pour l'accessibilité de l'objet instancié depuis les fonctions evt
			//Permettre de reconstruire le meme objet plusieurs fois sans conflit (de même id)
			for ( var i = 0; i < objects.length; i++) {
				if (this.id == objects[i].id ){
					indiceFound=i;
				}
			}
			if (indiceFound > -1){
				objects.splice(indiceFound,1);
			}
			objects.push(this);			
		}else {
			alert(Object.prototype.toString.call( props ) +'is not [object Object]');
			return 1;
		}
	}
	
	//raffraichissement image 10 ms en mode drag&drop 
	this.initRefresh = function() {
		var obj=this;
		return setInterval(function () {obj.updatePicture();} ,10);
	}

	//active ou desactive le mode deplacement:
	//permet de consommer moins de ressources car le drag n drop est couteux
	this.switchModeDragNDrop=function() {
		if (!this.isDragNDropActive){
			document.getElementById(this.id).addEventListener('mouseup',this.mouseUp);
			document.getElementById(this.id).addEventListener('mousedown',mouseDown) ;
			document.getElementById(this.id).addEventListener('mousemove',mouseMoved);
			this.repeatTimer=this.initRefresh();
		} else {
			clearInterval(this.repeatTimer);
			this.repeatTimer=null;
			document.getElementById(this.id).removeEventListener('mouseup',this.mouseUp);
			document.getElementById(this.id).removeEventListener('mousedown',mouseDown) ;
			document.getElementById(this.id).removeEventListener('mousemove',mouseMoved);
			document.getElementsByTagName('BODY')[0].style.cursor = 'default';
		}
		this.isDragNDropActive = (!this.isDragNDropActive);
	}
	
	//Raffraichissement Image
	this.updatePicture = function(){
		var cntUp;
		var cntDn;
		this.draw();
		var canv=document.getElementById(this.id);
		if (this.teams[up])
			cntUp=this.teams[up].players.length;
		else 
			cntUp=0;
		
		if (this.teams[down])
			cntDn=this.teams[down].players.length;
		else 
			cntDn=0;
		for ( var i=0;i < cntUp ; i++ ) {
			this.drawPlayer(this.teams[up].players[i], up );
			this.writePlayer(this.teams[up].players[i]);
		}
		for ( var i=0;i < cntDn ; i++ ) {
			this.drawPlayer(this.teams[down].players[i], down);
			this.writePlayer(this.teams[down].players[i]);
		}
	}
	
	//export image au format png (defaut)
	this.toDataUrl = function(){
		var canvas=document.getElementById(this.id);
		var url=canvas.toDataURL();
		this.checkInstallRequired(this.renderImgId,'img');
		document.getElementById(this.renderImgId).setAttribute('src',url);
	}
	
	// trouver la position absolue d'un element
	function findXY(objid) {
		var obj=document.getElementById(objid);
        var p = {};
        p.x = obj.offsetLeft;
        p.y = obj.offsetTop;
        while (obj.offsetParent) {
            if (obj == document.getElementsByTagName("BODY")[0]) {
				break;
            }
            else {
				if (obj.style.position != 'absolute')
				{
					p.x = p.x + obj.offsetParent.offsetLeft;
					p.y = p.y + obj.offsetParent.offsetTop;
					obj = obj.offsetParent;
				}else {
					p.x += obj.offsetLeft;
					p.y += obj.offsetTop;
					obj = obj.offsetParent;
				}
            }
        }
        return p;
    }
	
	// recommencer de zero
	this.raz = function(){
		if (this.type==doubleTeamPitch){
			if (this.teams) {
				this.teams[up].players=[];
				this.teams[down].players=[];
			}
		}
		else 
			this.teams[this.direction].players=[];
		this.draw();
	}
	
	//tracage du terrain ou demi terrain
	this.draw = function() {
		
		var canvas = document.getElementById(this.id);
		//largeur des bandes de couleurs de pelouse
		var bandWth = this.height / this.grassStripesNumber;
		var yend;
			
		//point de coupe pour demi terrain: 2/3 de la hauteur offre un bon rendu
		var cutPt=2/3;
		//les valeurs de x et y redondantes dans les calculs
		//prenons soin du processeur
		var xcenter = this.topX + (this.width / 2);
		
		if (this.type==halfPitch){
			yend = this.topY + Math.round(this.height*cutPt);
			if (this.direction==up) yend = Math.round(this.height*cutPt);
		} 
		else {
			yend = this.topY + this.height;
		}
		
		var xend = this.topX + this.width;
		
		var ycenter ;
		if (this.type==halfPitch && this.direction==up) {
			ycenter = Math.round((this.height * cutPt)  - this.height/2);
		} 
		else ycenter = Math.round(this.topY + (this.height / 2));
		
		var scaleMetersPx = this.width / this.widthIRL;
		
		//pour eviter ques les buts depassent du canevas
		var scaleMetersGoalPx;
		if (2.44 * scaleMetersPx > this.topY) {
			scaleMetersGoalPx = (this.topY/2.44) - 2; 
		} else scaleMetersGoalPx = scaleMetersPx;
		
		//largeur du terrain + cadre:
		canvas.width = this.width + (this.topX*2);
		if (this.type==halfPitch) {
			canvas.height = Math.round((this.height*cutPt)+(this.topY));
		} else {
			canvas.height = (this.height)+(this.topY*2);
		}

		// rayon du rond central 
		//et rayon de l'arc autour du point de penalty
		var centralCircleRad=(9.15* (this.width / this.widthIRL));

		var context = canvas.getContext("2d");
		context.strokeStyle = "#F5F5F5";
		context.lineWidth = this.lineWidth;
		context.fillStyle = this.grassColor1;
		
		
		if (this.type==halfPitch ) {
			context.fillRect(0, 0, this.width+(this.topX*2), (this.height*2/3)+(this.topY*2) );
		} else {
			context.fillRect(0, 0, this.width+(this.topX*2), (this.height)+(this.topY*2) );
		}
		var tmpY;
		
		//dessin du degradé de couleurs de tonte
		if (this.type==halfPitch && this.direction==up)
			tmpY=this.height*cutPt - bandWth ;
		else 
			tmpY=this.topY;
		
		for (var i=0;i<this.grassStripesNumber;i++) {
			if (i%2==0) {
				context.fillStyle = this.grassColor2;
			}
			else {
				context.fillStyle = this.grassColor1;
			}
			context.fillRect(this.topX, tmpY, this.width, bandWth );
			if (this.type==halfPitch && this.direction==up)
				tmpY=tmpY - bandWth;
			else tmpY=tmpY + bandWth;
		}
		
		//contour exterieur
		context.beginPath();
		if (this.type==halfPitch && this.direction==down){
			context.rect(this.topX, this.topY,this.width,yend);
		}else if (this.type==halfPitch && this.direction==up){
			context.rect(this.topX, 0,this.width,yend);
		}else {
			context.rect(this.topX, this.topY,this.width,this.height);
		}
		context.stroke();
			  
		//Mediane
		context.beginPath();
		context.moveTo(this.topX,ycenter);
		context.lineTo(xend,ycenter);
		context.stroke();

		//Rond central
		context.beginPath();
		context.arc(xcenter,ycenter, centralCircleRad, 0, 2*Math.PI);
		context.arc(xcenter,ycenter, this.lineWidth/2, 0, 2*Math.PI);
		context.stroke();
		
		if (this.type != halfPitch || this.direction == down) {
			//surface des 16.5m haut
			context.beginPath();
			context.moveTo(xcenter + (20.15*scaleMetersPx), this.topY);
			context.lineTo(xcenter + (20.15*scaleMetersPx), this.topY + (16.5 * scaleMetersPx) );
			context.lineTo(xcenter - (20.15*scaleMetersPx), this.topY + ( 16.5 * scaleMetersPx ));
			context.lineTo(xcenter - (20.15*scaleMetersPx), this.topY );
			context.stroke();
				  
			//surface des 5.5m haut
			context.beginPath();
			context.moveTo(xcenter + (9.15*scaleMetersPx), this.topY);
			context.lineTo(xcenter + (9.15*scaleMetersPx), this.topY + (5.5 * scaleMetersPx) );
			context.lineTo(xcenter - (9.15*scaleMetersPx), this.topY + (5.5 * scaleMetersPx));
			context.lineTo(xcenter - (9.15*scaleMetersPx), this.topY );
			context.stroke();

			//pt penalty haut
			context.beginPath();
			context.arc(xcenter, this.topY + (11 * scaleMetersPx),this.lineWidth/2,0,2*Math.PI);
			context.stroke();

			//arc surface haut
			context.beginPath();
			context.arc(xcenter, this.topY + (11 * scaleMetersPx),centralCircleRad,Math.PI/5,(4* Math.PI/5));
			context.stroke();
			//buts haut
			context.beginPath();
			context.moveTo(xcenter - (3.66*scaleMetersPx), this.topY);
			context.lineTo(xcenter - (3.66*scaleMetersPx), this.topY - (2.44*scaleMetersGoalPx));
			context.lineTo(xcenter + (3.66*scaleMetersPx), this.topY - (2.44*scaleMetersGoalPx));
			context.lineTo(xcenter + (3.66*scaleMetersPx), this.topY);
			context.stroke();
			
			//corners hauts
			context.beginPath();
			context.arc(this.topX, this.topY, this.cornerRadius*scaleMetersPx, 0, Math.PI/2);
			context.stroke();
			context.beginPath();
			context.arc(xend, this.topY, this.cornerRadius*scaleMetersPx, Math.PI/2, Math.PI);
			context.stroke();
		}
		if (this.direction == up || this.type != halfPitch ) {
			//surface des 16.5m bas
			context.beginPath();
			context.moveTo(xcenter + (20.15*scaleMetersPx), yend);
			context.lineTo(xcenter + (20.15*scaleMetersPx), yend - (16.5 * scaleMetersPx) );
			context.lineTo(xcenter - (20.15*scaleMetersPx), yend - (16.5 * scaleMetersPx ));
			context.lineTo(xcenter - (20.15*scaleMetersPx), yend);
			context.stroke();


			//surface des 5.5m bas
			context.beginPath();
			context.moveTo(xcenter + (9.15*scaleMetersPx), yend);
			context.lineTo(xcenter + (9.15*scaleMetersPx), yend - (5.5 * scaleMetersPx) );
			context.lineTo(xcenter - (9.15*scaleMetersPx), yend - (5.5 * scaleMetersPx ));
			context.lineTo(xcenter - (9.15*scaleMetersPx), yend);
			context.stroke();

			//pt penalty bas
			context.beginPath();
			context.arc(xcenter, yend - (11 * scaleMetersPx), this.lineWidth/2,0,2*Math.PI);
			context.stroke();

			//arc surface bas
			context.beginPath();
			context.arc(xcenter, yend - (11 * scaleMetersPx), centralCircleRad,(6* Math.PI/5),9*Math.PI/5);
			context.stroke();
	
			//buts bas
			context.beginPath();
			context.moveTo(xcenter - (3.66*scaleMetersPx), yend );
			context.lineTo(xcenter - (3.66*scaleMetersPx), yend + (2.44 * scaleMetersGoalPx));
			context.lineTo(xcenter + (3.66*scaleMetersPx), yend + (2.44 * scaleMetersGoalPx));
			context.lineTo(xcenter + (3.66*scaleMetersPx), yend);
			context.stroke();
			
			//les pts de corner du bas
			
			context.beginPath();
			context.arc(this.topX, yend, this.cornerRadius*scaleMetersPx, 3*Math.PI/2,0);
			context.stroke();
			context.beginPath();
			context.arc(xend, yend, this.cornerRadius*scaleMetersPx, Math.PI, 3*Math.PI/2);
			context.stroke();
		}
    }
		
	this.drawPlayer = function(player,dir){
		var cnv=document.getElementById(this.id);
		var imgGl=new Image();
		var imgYc=new Image();
		var imgRc=new Image();
		
		imgGl.src=this.iconesFiles.ball;
		imgYc.src=this.iconesFiles.yellowCard;
		imgRc.src=this.iconesFiles.redCard;
		var context = cnv.getContext("2d");
		
		//si ombre activee
		if (this.shadow===true){
			context.shadowBlur=5;
			context.shadowColor="black";
		}
		
		var nbStr=this.teams[dir].numberOfStripes;
		var symetricAxeAngle, angle, symetricAngle;
		var R=this.playerSize;	
			
		//verticals and horizontals stripes on jersey
		//Explanation of this algorithm applied to the behavior 
		//of arc canvas function where the goal is to setup the Jersey's stripes verticaly or horizontaly 
		//
		//The stripes, in fact,are corresponding to the filling of  2 symetric arcs corresponding to the PI/2 angle axis 
		//(the symetry axis for horizontals stripes) or PI (axis for verticals stripes) or other angles.
		//
		//For this,we have to init the symetric axis depending on jersey's stripes direction .
		//And to get the starting angle and ending angle, we have just to add the value of angle var(initialized with axis angle) 
		//to the angle (PI divided by the number of stripes) and to substract this angle to the same var angle.
		

		if (this.teams[dir].teamColor!=this.teams[dir].teamColorB){
			
			switch (this.teams[dir].stripesType){
				case horizontal:
					symetricAxisAngle=Math.PI/2;
					break;
				case vertical:
					symetricAxisAngle=Math.PI;
					break;
				case oblic45:
					symetricAxisAngle=3*Math.PI/4;
					break;
				case oblic135:
					symetricAxisAngle=Math.PI/4;
					break;
			}
			angle=0;
			symetricAngle=0;
			//x represents the value of the cosinus	obtained by cutting the horizontal axis 
			//into equals parts (number of stripes)			
			var x=player.x-R+(R/(nbStr/2));

			for (var i=0; i < nbStr;i++){

				context.beginPath();  
				if (i%2==0){
					context.fillStyle=this.teams[dir].teamColor;
				}else{
					context.fillStyle=this.teams[dir].teamColorB;
				}
				if (i==0)
					context.arc(player.x, player.y, R, 0, 2 * Math.PI);
				else{
					context.arc(player.x,player.y,R, angle,symetricAngle);

				}
				angle=Math.acos((player.x-x)/R)-symetricAxisAngle;
				symetricAngle=-Math.acos((player.x-x)/R)-symetricAxisAngle;;
				x+=R/(nbStr/2);

				context.fill(); 
			}
			/*
			//this 2nd algo is an alternative 
			angle=symetricAxisAngle;
			symetricAngle=symetricAxisAngle;
			for ( var i=0 ; i<nbStr; i++){
				context.beginPath();
				//alternative colors
				if (i%2==1){
					context.fillStyle=this.teams[dir].teamColor;
				}else{
					context.fillStyle=this.teams[dir].teamColorB;
				}
				
				if (i==0){
					//first arc is a full circle
					//filled with the first color 
					context.arc(player.x, player.y, this.playerSize, 0, 2*Math.PI);
				}
				else {
					//others are the arcs where angles are added(on one side of the axis) and substracted (on the other side) 
					//to the value Math.PI/nbStr, to get the starting and ending point of the arc
					//
					//all stripes will appear at the end of iterations.					
					context.arc(player.x, player.y, this.playerSize, angle, symetricAngle);
					
				}
				angle+= Math.PI/nbStr;
				symetricAngle -= Math.PI/nbStr;
				context.fill();
			}*/
		}else{
			context.beginPath();
			//context.strokeStyle=null;
			context.fillStyle=this.teams[dir].teamColor;
			context.arc(player.x, player.y, this.playerSize, 0, 2*Math.PI);
			context.fill();
		}
		
		
		//les bras 
			
		context.strokeStyle=this.teams[dir].teamColor;
		context.beginPath();
		context.lineWidth=this.playerSize*0.8;
		context.moveTo(player.x-this.playerSize*1.5,player.y);
		context.lineTo(player.x-this.playerSize-1,player.y);
		context.moveTo(player.x+this.playerSize*1.5,player.y);
		context.lineTo(player.x+this.playerSize+1,player.y);
		context.stroke();
		
		//les tetes en noir
		context.beginPath();
		if (this.shadow===true){
			context.shadowBlur=0;
		}
		context.lineWidth=1;
		context.fillStyle="black";
		context.arc(player.x, player.y,(this.playerSize*0.5),0,2*Math.PI);
		context.fill();
		
		
		// incrustation des images buts, cartons
		var shiftDist=this.playerSize;
		var obj=this;
		imgGl.onload = function(){
			var startX;
			startX=Math.round(player.x - 6 - 12*(player.goals-1)/2); 
			for (var i=0; i < player.goals; i++){
				if (dir===down)
					context.drawImage(imgGl,0,0,12,12,  startX+12*i, player.y+shiftDist*1.5 ,12,12 );
				else context.drawImage(imgGl,0,0,12,12, startX+12*i, player.y-shiftDist*3  ,12,12 );
			}
		};
		imgYc.onload = function(){
			
			for (var i=0; i < player.ycards; i++){
				var X1=player.x-12 - 2*shiftDist*(i+1);
				var X2=player.x + 2*shiftDist*(i+1);
							
				if (dir===down)
					context.drawImage(imgYc,0,0,9,12, X1, (player.y - 6) ,9,12 );
				else context.drawImage(imgYc,0,0,9,12,X2, (player.y - 6) ,9,12 );
			}
		};
		imgRc.onload = function(){
			
			for (var i=0; i < player.rcards; i++){
				var X1=player.x + 2*shiftDist*(i+1);
				var X2=player.x-9 - 2*shiftDist*(i+1);
							
				if (dir===down)
					context.drawImage(imgRc,0,0,9,12, X1, (player.y - 6) ,9,12 );
				else context.drawImage(imgRc,0,0,9,12,X2, (player.y - 6) ,9,12 );
			}
		};
		context.closePath();
		
	}
	
	this.addPlayer = function(X,Y,dir){
		X=Math.round(X); Y=Math.round(Y);
		var scale=this.widthIRL/this.width;
		if (this.type !=halfPitch){
			this.teams[dir].players.push({
						x: Math.round(X), y: Math.round(Y), 
						name:"", goals:0, ycards:0, rcards:0, 
						meterX: (X-this.topX) * scale, meterY:(Y-this.topY) * scale});
		}else{
			if (dir == up){
				this.teams[dir].players.push({
						x: Math.round(X), y: Math.round(Y), 
						name:"", goals:0, ycards:0, rcards:0, 
						meterX:  (X-this.topX) * scale, meterY:(Y * scale)});	
			}
			if (dir == down){
				this.teams[dir].players.push({
						x: Math.round(X), y: Math.round(Y), 
						name:"", goals:0, ycards:0, rcards:0, 
						meterX: (X-this.topX) * scale, meterY:(Y-this.topY) * scale});	
			}
		}
	}
	
	
	this.removePlayer = function(x,y){
		var indice=this.findSelClkPlayer(x,y);
		if (indice > -1) {
			this.teams[this.getDirection(y)].players.splice(indice,1);
		}
		this.updatePicture();
	}
	
	this.findSelClkPlayer = function (x,y){
		var d;
		if (this.teams){
			if (this.teams.length>0){
				if (this.teams[up]){
					for (var i=0; i < this.teams[up].players.length; i++ ){
						d=(x-this.teams[up].players[i].x) * (x-this.teams[up].players[i].x) + (y-this.teams[up].players[i].y)*(y-this.teams[up].players[i].y);
						if ( d < this.sqrDistBtwPl) {
							return i;
						}			
					}
				}
				if (this.teams[down]){
					for (var i=0; i < this.teams[down].players.length; i++ ){
						d=(x-this.teams[down].players[i].x) * (x-this.teams[down].players[i].x) + (y-this.teams[down].players[i].y)*(y-this.teams[down].players[i].y);
						if ( d < this.sqrDistBtwPl) {
							return i;
						}
					}
				}
			}
		}
		return -1;
	}
	
	//incrustation du texte sous les joueurs
	this.writePlayer = function (player){
		var canvas=document.getElementById(this.id);
		var context = canvas.getContext("2d");
		context.lineWidth=2;
		context.fillStyle=this.teams[this.getDirection(player.y)].textColor; 
		context.font=this.textStyle;
		context.textAlign='center';
		if (this.getDirection(player.y)==down)
			context.fillText( player.name, player.x,( player.y - (this.playerSize*1.5)));
		else context.fillText( player.name, player.x,( player.y + (this.playerSize*2.5)));
	}
	
	//Renvoie la direction de l'equipe sur le terrain
	this.getDirection= function (y) {
		if (this.type==doubleTeamPitch) {
			if ( y < (this.height/2 + this.topY))
				return down;
			else return up;
		}else {
			return this.direction;
		}
	}
	
	//Ouvrir et charger l'outil de parametrage à partir des paramétres passés à l'init
	//La palette provient de la classe jscolor () telechargée sur le site de l'editeur http://jscolor.com/
	//
	this.showConfigMenu = function (){
		
		if (this.isConfigMenuActive===false){
			var obj=this;
			var divForm=document.createElement('div');
			var cnv=document.getElementById(this.id);
			var cnvleft=parseInt(cnv.style.left);
			var cnvtop=parseInt(cnv.style.top);
			var cnvwidth=parseInt(cnv.style.width);
			var properties=this.lastProperties;
			
			divForm.id='_sp_form_configMenu';
			divForm.style.position='absolute';
			divForm.style.left=((this.offsetLeft+this.width+2*this.topX)+10)+'px' ;
			divForm.style.top=this.offsetTop+'px';
			divForm.innerHTML=this.menuConfig;
			
			document.getElementsByTagName('BODY')[0].appendChild(divForm);
			//declaration des colors picker de la class opensource jscolor GNU GP V3 
			//site de l'editeur http://jscolor.com/
			//ou plein d'exemples sont également détaillés sur les colors pickers
			//(en attendant que les colors pickers debarquent sur tous les navigateurs)
			var teamCol1 = document.getElementById('_sp_input_teamColor1');
			var teamCol1V = document.getElementById('_sp_input_teamColor1V');
			var teamCol2 = document.getElementById('_sp_input_teamColor2');
			var teamCol2V = document.getElementById('_sp_input_teamColor2V');
			var textCol1 = document.getElementById('_sp_input_textColor1');
			var textCol2 = document.getElementById('_sp_input_textColor2');
			var picker1 = new jscolor(teamCol1,{hash:true});
			var picker2 = new jscolor(textCol1,{hash:true});
			var picker3 = new jscolor(teamCol1V,{hash:true});
			var picker4 = new jscolor(teamCol2,{hash:true});
			var picker5 = new jscolor(textCol2,{hash:true});
			var picker6 = new jscolor(teamCol2V,{hash:true});
			
			
			this.menuElt=divForm;//mieux pour le fermer
						
			//Recuperation des valeurs paramétrés
			document.getElementById("_sp_sel_typepitch").value=properties.type;
			document.getElementById("_sp_input_range_pxWidth").value=properties.width;
			document.getElementById("_sp_span_res_pW").innerHTML=properties.width;
			document.getElementById("_sp_span_res_sP").innerHTML=properties.playerSize;
			
			
			document.getElementById("_sp_input_range_pxPlSize").value=properties.playerSize;
			document.getElementById("_sp_sel_nbTeams").value=properties.teams.length;
			if (properties.teams.length >0){
				document.getElementById("_sp_input_teamColor1").value=properties.teams[0].teamColor;
				document.getElementById("_sp_input_teamColor1V").value=properties.teams[0].teamColorB;
				document.getElementById("_sp_input_teamColor1").style.backgroundColor=properties.teams[0].teamColor;
				document.getElementById("_sp_input_teamColor1V").style.backgroundColor=properties.teams[0].teamColorB;
				document.getElementById("_sp_input_range_nbStripesT1").value=properties.teams[0].numberOfStripes;
				document.getElementById("_sp_span_res_nbs1").innerHTML=properties.teams[0].numberOfStripes;
				document.getElementById("_sp_sel_stripesOrientation1").value=properties.teams[0].stripesType;
				document.getElementById("_sp_input_textColor1").value=properties.teams[0].textColor;
				document.getElementById("_sp_input_textColor1").style.backgroundColor=properties.teams[0].textColor;
				document.getElementById("_sp_sel_direction1").value=properties.teams[0].direction;
				if (properties.teams.length < 2) {
					document.getElementById("_sp_input_teamColor2").disabled=true;
					document.getElementById("_sp_input_teamColor2V").disabled=true;
					document.getElementById("_sp_input_range_nbStripesT2").disabled=true;
					document.getElementById("_sp_input_textColor2").disabled=true;
					document.getElementById("_sp_sel_direction2").disabled=true;
					document.getElementById("_sp_sel_stripesOrientation2").disabled=true;
				}
			}
			if (properties.teams.length > 1){
				document.getElementById("_sp_input_teamColor2").value=properties.teams[1].teamColor;
				document.getElementById("_sp_input_teamColor2").style.backgroundColor=properties.teams[1].teamColor;
				document.getElementById("_sp_input_teamColor2V").value=properties.teams[1].teamColorB;
				document.getElementById("_sp_input_teamColor2V").style.backgroundColor=properties.teams[1].teamColorB;
				document.getElementById("_sp_input_range_nbStripesT2").value=properties.teams[1].numberOfStripes;
				document.getElementById("_sp_input_textColor2").value=properties.teams[1].textColor;
				document.getElementById("_sp_input_textColor2").style.backgroundColor=properties.teams[1].textColor;
				document.getElementById("_sp_sel_direction2").value=properties.teams[1].direction;
				document.getElementById("_sp_span_res_nbs2").innerHTML=properties.teams[1].numberOfStripes;
				document.getElementById("_sp_sel_stripesOrientation2").value=properties.teams[1].stripesType;
				document.getElementById("_sp_input_teamColor2").disabled=false;
				document.getElementById("_sp_input_teamColor2V").disabled=false;
				document.getElementById("_sp_input_textColor2").disabled=false;
				document.getElementById("_sp_input_range_nbStripesT2").disabled=false;
				document.getElementById("_sp_sel_direction2").disabled=false;
				document.getElementById("_sp_sel_stripesOrientation2").disabled=false;
			}
			document.getElementById("_sp_input_range_pxPlSize").value=properties.playerSize;
			
			//Listeners
			document.getElementById("_sp_sel_typepitch").addEventListener("change",
				function() { 
					if (parseInt(document.getElementById("_sp_sel_typepitch").value) ==halfPitch) { 
						if (properties.teams.length==2) {
							if (confirm("Warning :  team will be removed!!")){
									properties.teams.splice(1,1);
									document.getElementById("_sp_input_teamColor2").disabled=true;
									document.getElementById("_sp_input_textColor2").disabled=true;
									document.getElementById("_sp_sel_direction2").disabled=true;
									document.getElementById("_sp_sel_stripesOrientation2").disabled=true;
									document.getElementById("_sp_input_range_nbStripesT2").disabled=true;
								}
								else {document.getElementById("_sp_sel_typepitch").value=properties.type;}
							}
						}
						document.getElementById("_sp_sel_nbTeams").value=properties.teams.length;
						properties.type = parseInt(document.getElementById("_sp_sel_typepitch").value);
						obj.raz();
						obj.setProperties(properties);
						obj.updatePicture();
					
				} );
			
			document.getElementById("_sp_input_range_pxWidth").addEventListener("change",
				function(e) {
					//if (e.keyCode==13)
						properties.width=parseInt(document.getElementById("_sp_input_range_pxWidth").value);
						document.getElementById("_sp_input_sub_closeConfig").click();
						obj.setProperties(properties);
						obj.updatePicture();
						obj.showConfigMenu();
				} );
				
			document.getElementById("_sp_input_range_nbStripesT1").addEventListener("change",
				function(e) { 
					//Cette action va provoquer un raz du terrain.
					if (properties.teams.length>0){
						properties.teams[0].numberOfStripes=parseInt(document.getElementById("_sp_input_range_nbStripesT1").value);
						document.getElementById("_sp_span_res_nbs1").innerHTML=properties.teams[0].numberOfStripes;
						obj.setProperties(properties);
						obj.updatePicture();
					}
				} );
				
			document.getElementById("_sp_input_range_nbStripesT2").addEventListener("change",
				function(e) { 
					//Cette action va provoquer un raz du terrain.
					if (properties.teams.length>1){
						properties.teams[1].numberOfStripes=parseInt(document.getElementById("_sp_input_range_nbStripesT2").value);
						document.getElementById("_sp_span_res_nbs2").innerHTML=properties.teams[1].numberOfStripes;
						obj.setProperties(properties);
						obj.updatePicture();
					}
				} );
			
			/*document.getElementById("_sp_input_range_mWidth").addEventListener("change",
				function(e) { 
					//Cette action va provoquer un raz du terrain.
					properties.widthIRL=parseInt(document.getElementById("_sp_input_range_mWidth").value);
					document.getElementById("_sp_span_res_mW").innerHTML=properties.widthIRL;
					obj.raz();
					obj.setProperties(properties);
					obj.updatePicture();
				} );*/
			
			document.getElementById("_sp_sel_nbTeams").addEventListener("change",
				function() { 
					//var nbteams=parseInt(document.getElementById("_sp_sel_nbTeams").value);
					if (properties.teams.length < 2) {
						properties.teams.push(new team(	{
														direction: parseInt(document.getElementById("_sp_sel_direction2").value),
														teamColor: document.getElementById("_sp_input_teamColor2").value,
														teamColorB:document.getElementById("_sp_input_teamColor2V").value, 														
														textColor:document.getElementById("_sp_input_textColor2").value
													} )
											);
						document.getElementById("_sp_sel_typepitch").value=fullPitch;
						properties.type=fullPitch;
						document.getElementById("_sp_input_teamColor2").disabled=false;
						document.getElementById("_sp_input_teamColor2V").disabled=false;
						document.getElementById("_sp_input_textColor2").disabled=false;
						document.getElementById("_sp_sel_direction2").disabled=false;
						document.getElementById("_sp_sel_stripesOrientation2").disabled=false;
						document.getElementById("_sp_input_range_nbStripesT2").disabled=false;
					} else {
						if (properties.teams.length == 2){
							properties.teams.splice(1,1);
							document.getElementById("_sp_input_teamColor2").disabled=true;
							document.getElementById("_sp_input_teamColor2V").disabled=true;
							document.getElementById("_sp_input_textColor2").disabled=true;
							document.getElementById("_sp_sel_direction2").disabled=true;
							document.getElementById("_sp_sel_stripesOrientation2").disabled=true;
							document.getElementById("_sp_input_range_nbStripesT2").disabled=true;
						}
					}
					document.getElementById("_sp_sel_nbTeams").value=properties.teams.length;
					obj.setProperties(properties);
					obj.updatePicture();																						
				});
			
			document.getElementById("_sp_input_range_pxPlSize").addEventListener("change",
				function(e) { 
					properties.playerSize=parseInt(document.getElementById("_sp_input_range_pxPlSize").value);
					document.getElementById("_sp_span_res_sP").innerHTML=properties.playerSize;
					obj.setProperties(properties);
					obj.updatePicture();
				} );
			
			document.getElementById("_sp_input_teamColor1").addEventListener("change",
				function() { 
					properties.teams[0].teamColor=document.getElementById("_sp_input_teamColor1").value;
					properties.teams[0].teamColorB=document.getElementById("_sp_input_teamColor1").value;
					document.getElementById("_sp_input_teamColor1V").value=document.getElementById("_sp_input_teamColor1").value;
					document.getElementById("_sp_input_teamColor1V").style.backgroundColor=document.getElementById("_sp_input_teamColor1").value;
					obj.setProperties(properties);
					obj.updatePicture();
				} );
				
			document.getElementById("_sp_input_teamColor1V").addEventListener("change",
				function() { 
					properties.teams[0].teamColorB=document.getElementById("_sp_input_teamColor1V").value;
					obj.setProperties(properties);
					obj.updatePicture();
				} );
			document.getElementById("_sp_sel_stripesOrientation1").addEventListener("change",
				function() { 
					if (properties.teams){
						if (properties.teams.length >0) {
							properties.teams[0].stripesType=parseInt(document.getElementById("_sp_sel_stripesOrientation1").value);
							obj.setProperties(properties);
							obj.updatePicture();
						} else{
							alert("Change before, the numbers of team");
						}
					} else alert("no team defined");																		 
				} );
				
			document.getElementById("_sp_input_textColor1").addEventListener("change",
				function() { 
					properties.teams[0].textColor=document.getElementById("_sp_input_textColor1").value;
					obj.setProperties(properties);
					obj.updatePicture();
				} );
																			
			document.getElementById("_sp_sel_direction1").addEventListener("change",
				function() { 
					if (properties.teams){
						properties.teams[0].direction=parseInt(document.getElementById("_sp_sel_direction1").value);
						if (properties.teams.length > 1)
							if (parseInt(document.getElementById("_sp_sel_direction2").value)==1)
								document.getElementById("_sp_sel_direction2").value=0;
							else document.getElementById("_sp_sel_direction2").value=1;
						obj.setProperties(properties);
						obj.updatePicture();
					} else alert("no team defined");																		
				} );
																			
			document.getElementById("_sp_sel_direction2").addEventListener("change",
				function() { 
					if (properties.teams){
						if (properties.teams.length > 1) {
							properties.teams[1].direction=parseInt(document.getElementById("_sp_sel_direction2").value);
							if (parseInt(document.getElementById("_sp_sel_direction1").value)==1)
								document.getElementById("_sp_sel_direction1").value=0;
							else document.getElementById("_sp_sel_direction1").value=1;
							obj.setProperties(properties);
							obj.updatePicture();
						} else{
							alert("Change before, the numbers of team");
						}
					} else alert("no team defined");																		 
				} );
																			
			document.getElementById("_sp_input_teamColor2").addEventListener("change",
				function() { 
					if (properties.teams){
						if (properties.teams.length > 1) {
							properties.teams[1].teamColor=document.getElementById("_sp_input_teamColor2").value;
							properties.teams[1].teamColorB=document.getElementById("_sp_input_teamColor2").value;
							document.getElementById("_sp_input_teamColor2V").value=document.getElementById("_sp_input_teamColor2").value;
							document.getElementById("_sp_input_teamColor2V").style.backgroundColor=document.getElementById("_sp_input_teamColor2").value;
							obj.setProperties(properties);
							obj.updatePicture();
						} else{
							alert("Change before, the numbers of team");
						}
					} else alert("no team defined");																		 
				} );
				
			document.getElementById("_sp_input_teamColor2V").addEventListener("change",
				function() { 
					if (properties.teams){
						if (properties.teams.length > 1) {
							properties.teams[1].teamColorB=document.getElementById("_sp_input_teamColor2V").value;
							obj.setProperties(properties);
							obj.updatePicture();
						} else{
							alert("Change before, the numbers of team");
						}
					} else alert("no team defined");																		 
				} );
			document.getElementById("_sp_sel_stripesOrientation2").addEventListener("change",
				function() { 
					if (properties.teams){
						if (properties.teams.length > 1) {
							properties.teams[1].stripesType=parseInt(document.getElementById("_sp_sel_stripesOrientation2").value);
							obj.setProperties(properties);
							obj.updatePicture();
						} else{
							alert("Change before, the numbers of team");
						}
					} else alert("no team defined");																		 
				} );
							
			document.getElementById("_sp_input_textColor2").addEventListener("change",
				function() { 
					if (properties.teams){
						if (properties.teams.length > 1) {
							properties.teams[1].textColor=document.getElementById("_sp_input_textColor2").value;
							obj.setProperties(properties);
							obj.updatePicture();
						} else{
							alert("Change before, the numbers of team");
						}
					} else alert("no team defined");																		
				} );
			
			document.getElementById("_sp_input_sub_closeConfig").addEventListener("click",
				function() { 
					obj.showConfigMenu();																		
				} );
			
			this.isConfigMenuActive=true;
		} else {
			document.getElementById("_sp_sel_typepitch").removeEventListener("change",null);
			document.getElementById("_sp_input_range_pxWidth").removeEventListener("change",null);
			document.getElementById("_sp_input_textColor2").removeEventListener("change",null);
			document.getElementById("_sp_input_teamColor2").removeEventListener("change",null);
			document.getElementById("_sp_input_teamColor2V").removeEventListener("change",null);
			document.getElementById("_sp_input_range_nbStripesT2").removeEventListener("change",null);
			document.getElementById("_sp_sel_direction2").removeEventListener("change",null);
			document.getElementById("_sp_sel_direction1").removeEventListener("change",null);
			document.getElementById("_sp_input_textColor1").removeEventListener("change",null);
			document.getElementById("_sp_input_teamColor1").removeEventListener("change",null);
			document.getElementById("_sp_input_teamColor1V").removeEventListener("change",null);
			document.getElementById("_sp_sel_stripesOrientation1").removeEventListener("change",null);
			document.getElementById("_sp_sel_stripesOrientation2").removeEventListener("change",null);
			document.getElementById("_sp_input_range_nbStripesT1").removeEventListener("change",null);
			document.getElementById("_sp_input_range_pxPlSize").removeEventListener("change",null);
			document.getElementById("_sp_sel_nbTeams").removeEventListener("change",null);
			document.getElementsByTagName('BODY')[0].removeChild(this.menuElt);
			this.menuElt=null;
			this.isConfigMenuActive=false;
		}
	}
	
	this.showHelp = function(){
		obj=this;
		if (this.helpActive===false){
			this.helpActive=true;
			this.helpElt=document.createElement('div');
			this.helpElt.id='_sp_div_rule';
			
			document.getElementsByTagName('BODY')[0].appendChild(this.helpElt);
			this.helpElt.innerHTML=this.htmlHlp;
			document.getElementById("closeHlp").addEventListener("click",function (){obj.showHelp();});
			
		}else {
			this.helpActive=false;
			var bdy=document.getElementsByTagName('BODY')[0];
			document.getElementById("closeHlp").removeEventListener("click",null);
			bdy.removeChild(this.helpElt);
			this.helpElt=null;
			
		}
		
	}
	
	//CONSTRUCTION

	//Garder une trace des parametres d'entrees
	this.initProperties=props;
	this.lastProperties=props;			
	
	
	this.helpActive=false;
	this.isConfigMenuActive=false;
	
	//parties code html des menus. 
	//Le Menu HTML 
	this.menuConfig="<div class='_sp_class_container'><span class='_sp_class_center'>CONFIGURATION</span><br><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_sel_typepitch'>Pitch Type :</label><select  id='_sp_sel_typepitch' ><option value=1>normal</option><option value=0>half</option></select><br><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_range_pxWidth'>Pitch width in px : <span id='_sp_span_res_pW' class='result'></span></label><input id='_sp_input_range_pxWidth' type='range' value='250' step='25' min='100' max='500' ><br><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_range_pxPlSize'>Player Size in px <span id='_sp_span_res_sP' class='result'></span></label><input id='_sp_input_range_pxPlSize' type='range' value='12' step='1' min='8' max='40' ><br><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_sel_nbTeams'>Numbers of teams</label><select  id='_sp_sel_nbTeams' ><option value=1>1</option><option value=2 selected>2</option></select><br><br><br>";
	
	this.menuConfig+="______________________________________________________<br><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_teamColor1'>Jersey color team 1</label><input id='_sp_input_teamColor1' ";
	this.menuConfig+=" value='choix couleur' size='7'><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_teamColor1V'>stripes</label><input id='_sp_input_teamColor1V' ";
	this.menuConfig+=" value='choix couleur' size='7'> Type:<select  id='_sp_sel_stripesOrientation1'> <option value='0'> verticals</option>  <option value='1'>horizontals</option> <option value='2'>obliques(45deg) / </option><option value='3'>obliques(135deg) \\ </option></select><br><br>";	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_range_nbStripesT1'>number of stripes <span id='_sp_span_res_nbs1' class='result'></span></label><input id='_sp_input_range_nbStripesT1' type='range' value='5' step='1' min='2' max='10' ><br><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_textColor1'>Text color</label><input id='_sp_input_textColor1' ";
	this.menuConfig+="value='choix couleur' size='7'><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_sel_direction1'>Direction</label><select id='_sp_sel_direction1'   >";
	this.menuConfig+="<option value=0>up</option>";
	this.menuConfig+="<option value=1>down</option>";
	this.menuConfig+="</select><br><br><br><br>";
	this.menuConfig+="______________________________________________________<br><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_teamColor2'>Jersey color team 2</label><input id='_sp_input_teamColor2' ";
	this.menuConfig+=" value='choix couleur' size='7'><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_teamColor2V'>Stripes</label><input id='_sp_input_teamColor2V' ";
	this.menuConfig+=" value='choix couleur' size='7'> Type:<select  id='_sp_sel_stripesOrientation2'> <option value='0'> verticales</option>  <option value='1'>horizontales</option> <option value='2'>obliques(45deg) / </option><option value='3'>obliques(135deg) \\ </option></select><br><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_range_nbStripesT2'>number of stripes <span id='_sp_span_res_nbs2' class='result'></span></label><input id='_sp_input_range_nbStripesT2' type='range' value='5' step='1' min='2' max='10' ><br><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_textColor2'>Text color</label><input id='_sp_input_textColor2' ";
	this.menuConfig+=" value='choix couleur' size='7'><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_sel_direction2'>Direction</label><select id='_sp_sel_direction2' >";
	this.menuConfig+="<option value=0>up</option>";
	this.menuConfig+="<option value=1 selected>down</option>";		
	this.menuConfig+="</select><br><br><br><br>";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_sub_validConfig' class='_sp_class_center'></label><input id='_sp_input_sub_validConfig'  type='button' value='Init' class='_sp_class_center' >";
	this.menuConfig+="<label class='_sp_class_label' for='_sp_input_sub_closeConfig' class='_sp_class_center'></label><input id='_sp_input_sub_closeConfig'  type='button' value='Close' class='_sp_class_center' ><br>";
	this.menuConfig+="</div>";
	
	//Aide HTML
	this.htmlHlp="<span class='_sp_class_obj'>How does it works?</span><div id='_sp_div_contentrule'>";
	this.htmlHlp+="<ul>";
	this.htmlHlp+="<li><span class='_sp_class_obj'>Single click :</span> Add a player <br> <span class='_sp_class_imp'> A player could be added only if the distance between an other player already added is greater than 3m converted in pixel(to get an idea - goal width is around 7,3m), the maximum number of players is fixed to 11</span></li>";
	this.htmlHlp+="<li><span class='_sp_class_obj'>drag&drop:</span>Move a player if the drag & drop mode is active (click on button \"Moving Mode I/O..\" to activate or desactivate the moving mode) <br><span class='_sp_class_imp'> Advice: Recommanded to desactivate drag & drop mode once the player(s) is/are moved: because of eventuals slow effects</span> </li>";
	this.htmlHlp+="<li><span class='_sp_class_obj'>Right click :</span> Remove a player <br> <span class='_sp_class_imp'> the first player who is 3m far at least (converted in pixel)from click location will be removed</span></li>";
	this.htmlHlp+="<li><span class='_sp_class_obj'>Double click :</span> Add/update text on a player and Enter or OK to valid</li>";
	this.htmlHlp+="<li><span class='_sp_class_obj'>Export Image Button :</span> Image is exported from the canvas element to the image element below: Then saving image become possible by right click on generated picture</li>";
	this.htmlHlp+="<li><span class='_sp_class_obj'>Parameters button :</span> Open or close the parameter panel menu: Object is dynamically updated</li>";
	this.htmlHlp+="<li><span class='_sp_class_obj'>Help button :</span> Open or Close this help panel.</li>";
	this.htmlHlp+="</ul>";
	this.htmlHlp+="<label for='closeHlp' class='_sp_class_center'></label><input id='closeHlp' class='_sp_class_center' type='button' value='Close'  ><br>";
	this.htmlHlp+="</div>";
	
	//playerForm HTML
	this.htmlPlEdit="<span class='_sp_class_center'>Player Edition</span><br><br>";
	this.htmlPlEdit+="<label class='_sp_class_labelEditPl' for='_sp_inputTxt_PlayerName'>Name:</label><input type='text' id='_sp_inputTxt_PlayerName' size='10'><br>";
	this.htmlPlEdit+="<label class='_sp_class_labelEditPl' for='_sp_inputTxt_goals'>Goals:</label><input type='text' id='_sp_inputTxt_goals' value='0' size='3' ><br>";
	this.htmlPlEdit+="<label class='_sp_class_labelEditPl' for='_sp_inputTxt_yCards'>Yellow c.:</label><input type='text' id='_sp_inputTxt_yCards' value='0' size='3'><br>";
	this.htmlPlEdit+="<label class='_sp_class_labelEditPl' for='_sp_inputTxt_rCards'>Red cards:</label><input type='text' id='_sp_inputTxt_rCards' value='0' size='3'><br>";
	this.htmlPlEdit+="<label class='_sp_class_labelEditPl' for='_sp_inputSub_player'></label><input type='button' id='_sp_inputSub_player' value='Ok' class='_sp_class_right' ><br>";
	
	//Boutons sous canvas
	this.htmlBottomMenu='';
	if (this.configMenu!==false) {
		this.htmlBottomMenu+="<br><input id='_sp_inputSub_configMenu' type='button' value='Parameters'><input id='_sp_inputSub_drgDrp' type='button' value='Moving Mode I/O'><input id='_sp_inputSub_DataURL' type='button' value='Export Image'>";
		this.htmlBottomMenu+="<input id='_sp_inputSub_help' type='button' value='Help'> ";
	}
	
	//Ne pas modifier
	//parametres internes pour les timers du drag n drop et double click
	this.repeatTimer=null;
	this.iTimer=null;
	this.isMouseDown=false;
	this.bDoubleCk=false;
	
	//Construction de l'objet via le parametrage
	//initialisiation des params (à la construction de l'obj)
	this.setProperties(props);
	if (this.configMenu===true)	this.buildBottomMenu();
	
	//ajout des listeners d'evenemment
	document.getElementById(this.id).addEventListener('dblclick',updatePlayer);
	document.getElementById(this.id).addEventListener('click',addPlayerEvt);
	document.getElementById(this.id).addEventListener('contextmenu',delPlayerEvt);
	
	//FIN CONSTRUCTION	
	
	
	
	/**
	**  Toutes les fonctions non encapsulables liées aux evenements 
	**/
	function delPlayerEvt(e){
		var obj=getObjEventCoord(Math.round(e.pageX),Math.round(e.pageY));
		e.preventDefault();
		if ( obj) {
			var canvas=document.getElementById(obj.id);
			var decX=obj.offsetLeft;
			var decY=obj.offsetTop;
			var cX=Math.round(e.pageX-decX);
			var cY=Math.round(e.pageY-decY);
			obj.removePlayer(cX,cY);
		}
	}
	
	//gestion de l'evenement ajout de Joueur	
	function addPlayerEvt(e){
		var obj=getObjEventCoord(Math.round(e.pageX),Math.round(e.pageY));
		obj.isMouseDown=false;
		if (obj) {
			var canvas=document.getElementById(obj.id);
			var decX=obj.offsetLeft;
			var decY=obj.offsetTop;
			var cX=Math.round(e.pageX-decX);
			var cY=Math.round(e.pageY-decY);
			
			obj.bDoubleCk = false;
			obj.iTimer = setTimeout( function(){
				if( !obj.bDoubleCk){
					if(obj.findSelClkPlayer(cX,cY)===-1){
						if (obj.teams[obj.getDirection(cY)].players.length<11) {
							obj.addPlayer(cX,cY,obj.getDirection(cY));
							obj.drawPlayer({x:cX,y:cY,goals:0,ycards:0,rcards:0},obj.getDirection(cY));
						}else {
							alert('Warning: limit of players reached');
						}
					}
				}
			}, 300);
		}
	}
	
	//Pour retrouver quel canvas correspond aux coordonnées d'un evenement
	function getObjEventCoord(x,y){
		var cnvX=0;
		var cnvY=0;
		var topY=0;
		var height;
		for (var i=0; i < objects.length ; i++)	{
			cnvX = objects[i].offsetLeft;
			cnvY = objects[i].offsetTop;
			//cas particuliers demi  terrain
			if (objects[i].direction == up && objects[i].type==halfPitch) {
				topY=0;	
				height=objects[i].height*2/3;
			} else { 
				if (objects[i].type==halfPitch){
					height=objects[i].height*2/3
				}else {
					height=objects[i].height;
				}
				topY=objects[i].topY;
			}
			if ( (objects[i].topX + cnvX < x) && (topY + cnvY < y) ) {
				if  ( ( ( objects[i].topX + cnvX + objects[i].width ) > x) && ( ( topY + cnvY + height ) > y ) ) {
					return objects[i];
				}
			}
		}
		return null;
	}
	
	//les coordonnees sont elles à proximité d'un joueur 
	//fonction utilisee par le drag and drop
	function isCursorOverPlayer(obj,x, y){
		return (obj.findSelClkPlayer(x,y) > -1);
	}
	
	
	
	this.mouseUp=function()	{
		this.isMouseDown = false;
	}
	
	function mouseDown(e){
		var scale;
		var obj=getObjEventCoord(Math.round(e.pageX),Math.round(e.pageY));
		scale=obj.widthIRL/obj.width;
		if (obj) {
			var decX=obj.offsetLeft;
			var decY=obj.offsetTop;
			if ( isCursorOverPlayer(obj,e.pageX-decX, e.pageY-decY) ){
				obj.teams[obj.getDirection(Math.round(e.pageY-decY))].players[ind].x=Math.round(e.pageX-decX);
				obj.teams[obj.getDirection(Math.round(e.pageY-decY))].players[ind].y=Math.round(e.pageY-decY);
				obj.teams[obj.getDirection(Math.round(e.pageY-decY))].players[ind].meterX=(Math.round(e.pageX-decX-obj.topX)*scale);
				if (obj.getDirection(Math.round(e.pageY-decY))==up && obj.type==halfPitch)
					obj.teams[obj.getDirection(Math.round(e.pageY-decY))].players[ind].meterY=(Math.round(e.pageY-decY)*scale);
				else obj.teams[obj.getDirection(Math.round(e.pageY-decY))].players[ind].meterY=(Math.round(e.pageY-decY-obj.topY)*scale);
				obj.isMouseDown = true;
			}
		}
	}
	
	
	
	//modification ou non des coordonnees d'un joueur lorsque la souris bouge
	//d'un joueur
	function mouseMoved(e){
		var scale;
		var obj=getObjEventCoord(Math.round(e.pageX),Math.round(e.pageY));
		if (obj){
			var decX=obj.offsetLeft;
			var decY=obj.offsetTop;
			scale = obj.widthIRL / obj.width ;
			ind = obj.findSelClkPlayer(Math.round(e.pageX-decX),Math.round(e.pageY-decY));
			
			if ( isCursorOverPlayer(obj,Math.round(e.pageX-decX),Math.round(e.pageY-decY) )){
				document.getElementsByTagName('BODY')[0].style.cursor = 'pointer';
			}
			else {
				document.getElementsByTagName('BODY')[0].style.cursor = 'default';
			}

			if (obj.isMouseDown) {
				obj.teams[obj.getDirection(Math.round(e.pageY-decY))].players[ind].x=Math.round(e.pageX-decX);
				obj.teams[obj.getDirection(Math.round(e.pageY-decY))].players[ind].y=Math.round(e.pageY-decY);
				obj.teams[obj.getDirection(Math.round(e.pageY-decY))].players[ind].meterX=(Math.round(e.pageX-decX-obj.topX)*scale);
				if (obj.getDirection(Math.round(e.pageY-decY))==up && obj.type==halfPitch)
					obj.teams[obj.getDirection(Math.round(e.pageY-decY))].players[ind].meterY=(Math.round(e.pageY-decY)*scale);
				else obj.teams[obj.getDirection(Math.round(e.pageY-decY))].players[ind].meterY=(Math.round(e.pageY-decY-obj.topY)*scale);
			}
		}
	}
	
	
	//Modifier le nom dun joueur par double-click
	function updatePlayer(evt){
		var dir;
		var obj=getObjEventCoord(Math.round(evt.pageX),Math.round(evt.pageY));
		if (obj) {
			obj.isMouseDown=false;
			obj.bDoubleCk = true;
			clearTimeout( obj.iTimer);
			var canv=document.getElementById(obj.id);
			var decX=obj.offsetLeft;
			var decY=obj.offsetTop;
			var decalageX;
			var decalageY;
			var ind=-1;
			ind = obj.findSelClkPlayer(Math.round(evt.pageX-decX),Math.round(evt.pageY-decY));
			dir = obj.getDirection(Math.round(evt.pageY-decY));
			if ( ind > -1 ) {
				if ( ! obj.editZone ){
					decalageY = 0;
					decalageX = 0;
					obj.editZone=document.createElement('div');
					obj.editZone.id='_sp_div_editZone';
					obj.editZone.style.position='absolute';
					obj.editZone.style.top=Math.round((obj.offsetTop + obj.teams[dir].players[ind].y + decalageY))+'px';
					obj.editZone.style.left=Math.round((obj.offsetLeft + obj.teams[dir].players[ind].x - decalageX ))+'px';
					obj.editZone.innerHTML=obj.htmlPlEdit;
					document.getElementsByTagName('BODY')[0].appendChild(obj.editZone);
					
					//integration à l'objet pour accessibilité par la suite via events ci dessous
					obj.inputTxt=document.getElementById('_sp_inputTxt_PlayerName');
					obj.inputTxt.value=obj.teams[dir].players[ind].name;
					obj.inputTxtGoals=document.getElementById('_sp_inputTxt_goals');
					obj.inputTxtGoals.value=obj.teams[dir].players[ind].goals;
					obj.inputTxtyCards=document.getElementById('_sp_inputTxt_yCards');
					obj.inputTxtyCards.value=obj.teams[dir].players[ind].ycards;
					obj.inputTxtrCards=document.getElementById('_sp_inputTxt_rCards');
					obj.inputTxtrCards.value=obj.teams[dir].players[ind].rcards;
					obj.submitBtn=document.getElementById('_sp_inputSub_player');
					obj.inputTxt.focus();
				}	
				obj.submitBtn.onclick=function(e){
					obj.teams[dir].players[ind].name=obj.inputTxt.value;
					obj.teams[dir].players[ind].goals=parseInt(obj.inputTxtGoals.value);
					obj.teams[dir].players[ind].ycards=parseInt(obj.inputTxtyCards.value);
					obj.teams[dir].players[ind].rcards=parseInt(obj.inputTxtrCards.value);
					var bdy=document.getElementsByTagName('BODY')[0];
					bdy.removeChild(obj.editZone);
					obj.editZone=null;
					obj.writePlayer(obj.teams[dir].players[ind]);
					obj.updatePicture();
				}
				obj.inputTxt.onkeypress=function(e){
					if(e.keyCode==13){
						obj.submitBtn.click();
					}
				}
				obj.inputTxtGoals.onkeypress=function(e){
					if(e.keyCode==13){
						obj.submitBtn.click();
					}
				}
				obj.inputTxtyCards.onkeypress=function(e){
					if(e.keyCode==13){
						obj.submitBtn.click();
					}
				}
				obj.inputTxtrCards.onkeypress=function(e){
					if(e.keyCode==13){
						obj.submitBtn.click();
					}
				}
			}
		}
	}
}
