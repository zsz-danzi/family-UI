
/*==============================
 * Project: 3D-礼物
 * Description: 个性化
 * @author: danzizhong
 * Time：2018.02.29
=================================*/	

function Medals(){
	this.clock = new THREE.Clock();
	this.mixers = [];
}

Medals.prototype.init = function(opt){

	console.time('run');

	var self = this;
	this.obj = document.getElementById(opt.id);
	this.model_url = opt.model_url;
	this.img_url_arr = opt.img_url_arr;
	this.color = opt.color || '#E4B849';
	this.finger_move = opt.finger_move || false;
	this.callback = opt.callback;
	this.loadFn = opt.loadFn;
	this.type = opt.type || 0;
	this.len = this.img_url_arr && this.img_url_arr.length;
	this.grav_flag = opt.grav_flag || true;

	this.object_pos_y = 50;

	//重力感应
	this.p = {};
    this.p.g = 0;

	//回正参数
	this.disX = 0; // 抬起的时候偏离
	this.up_flag = false; //手指抬起
	this.first_flag = true; //第一次
	this.target_lon = 0; //0、360deg || 180deg
	this.speed = 0; 
	this.speed_normal = 0.98;
	this.ani_another = false;


	this.scale = window.innerWidth / 375 ;

	//three.js 初始化
	this.threes_init();

	//设置模型
	this.loadModel(function(object){

		self.object = object;
		self.object.scale.set(.38,.38,.38);
		// self.object.scale.set(.8,.8,.8);
		self.object.position.set(0, self.object_pos_y ,0);

		//设置颜色
		self.setColor();

		//添加文字
		self.setText('10月NO.1');


		//添加手指滑动事件
		if(self.finger_move){
			self.speedx = 0;
			self.lon = 0;
			self.theta = 0;
			self.obj.addEventListener( 'touchstart', self.onDocumentMouseDown.bind(self), false );
        	self.obj.addEventListener( 'touchmove', self.onDocumentMouseMove.bind(self), false );
        	self.obj.addEventListener( 'touchend', self.onDocumentMouseUp.bind(self), false );	
		};

		self.animate();

		self.loadFn && self.loadFn();

		console.timeEnd('run');

		//添加重感应
		self.gravFn();

	});

	return this;
}

Medals.prototype.threes_init = function(){
	var self = this;

	this.camera = new THREE.PerspectiveCamera( 45, this.obj.offsetWidth / this.obj.offsetHeight, 1, 2000 );
	// this.camera =new THREE.OrthographicCamera(this.obj.offsetWidth/-2,this.obj.offsetWidth/2,this.obj.offsetHeight/2,this.obj.offsetHeight/-2,1,2000);

	this.camera.position.set( 0, 0, 1000 );
	this.camera.lookAt(0,0,0);

	this.scene = new THREE.Scene();
	// this.scene.background = new THREE.Color( 0xa0a0a0 );
	// this.scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

	//半球光 光源
	// var light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
	// light.position.set( 0, 200, 0 );
	// this.scene.add( light );

	//聚光灯 光源
	// var spotLight = new THREE.SpotLight(0xffffff);
	// spotLight.position.set(0,400,-200);
	// spotLight.intensity = .8;
	// this.scene.add( spotLight );
	// console.log(spotLight)

	//环境光
	var ambientLight = new THREE.AmbientLight(0xffffff);
	ambientLight.intensity = 2;
	this.scene.add(ambientLight);

	//点光源
	// var pointLight = new THREE.PointLight( 0xffffff, .5, 300 , 1); //PointLight( color : Integer, intensity : Float, distance : Number, decay : Float )
	// pointLight.position.set(0,100,200);
	// pointLight.castShadow = true;
	// this.scene.add( pointLight );

	//矩阵光
	var rectLight = new THREE.RectAreaLight( 0xffffff, 4,  50, 600 );
	rectLight.position.set( 300, 150 , 100 );
	rectLight.lookAt( 0, 0, 0 );

	var rectLightMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial() );
	rectLightMesh.scale.x = rectLight.width;
	rectLightMesh.scale.y = rectLight.height;
	// rectLight.add( rectLightMesh );

	var rectLightMeshBack = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial( { color: 0x080808 } ) );
	rectLightMeshBack.rotation.y = Math.PI;
	// rectLightMesh.add( rectLightMeshBack );

	this.scene.add( rectLight );

	//矩阵光2
	var rectLight2 = new THREE.RectAreaLight( 0xffffff, 2, 50, 600 );
	rectLight2.position.set( -300, 150 , -100 );
	rectLight2.lookAt( 0, 0, 0 );

	var rectLightMesh2 = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial() );
	rectLightMesh2.scale.x = rectLight2.width;
	rectLightMesh2.scale.y = rectLight2.height;
	// rectLight2.add( rectLightMesh2 );

	var rectLightMeshBack2 = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial( { color: 0x080808 } ) );
	rectLightMeshBack2.rotation.y = Math.PI;
	// rectLightMesh2.add( rectLightMeshBack2);

	this.scene.add( rectLight2 );

	//平行光
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 200, 100, 300 );
	light.castShadow = true;
	light.shadow.camera.top = 180;
	light.shadow.camera.bottom = -100;
	light.shadow.camera.left = -120;
	light.shadow.camera.right = 120;
	light.intensity = .4;
	this.light = light;
	this.scene.add( light );


	//测试物体
	var matStdObjects = new THREE.MeshStandardMaterial( { color: 0xA00000, roughness: 0, metalness: 0 } );
	var geoSphere = new THREE.SphereBufferGeometry( 200, 32, 32 );
	var mshStdSphere = new THREE.Mesh( geoSphere, matStdObjects );
	mshStdSphere.position.set( - 5, 5, 0 );
	mshStdSphere.castShadow = true;
	mshStdSphere.receiveShadow = true;
	// this.scene.add( mshStdSphere );


	//ground
	// var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
	// mesh.rotation.x = - Math.PI / 2;
	// mesh.receiveShadow = true;
	// this.scene.add( mesh );

	// var grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
	// grid.material.opacity = 0.2;
	// grid.material.transparent = true;
	// this.scene.add( grid );

	this.renderer = new THREE.WebGLRenderer( { 
		antialias: true ,
		alpha : true   //渲染透明
	} );

	this.renderer.setPixelRatio( window.devicePixelRatio );
	this.renderer.setSize( this.obj.offsetWidth, this.obj.offsetHeight );
	this.renderer.shadowMap.enabled = true;
	this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	// this.renderer.gammaInput = true;
	// this.renderer.gammaOutput = true;
	this.obj.appendChild( this.renderer.domElement );

	window.addEventListener( 'resize', self.resize.bind(self) , false );

	// var controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
	// controls.update();	
}

Medals.prototype.resize = function(){
	this.camera.aspect = this.obj.offsetWidth / this.obj.offsetHeight;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize( this.obj.offsetWidth, this.obj.offsetHeight );	
}

//设置颜色
Medals.prototype.setColor = function(color){

	if(!this.object) return;

	console.log(this.object)

	//徽章
	const huizhang = this.object.getObjectByName('huizhang');
	var HSL = new THREE.Color( '#b25e41' ).getHSL({ h: 0, s: 0, l: 0 });
	HSL.s *= 0.5;
	huizhang.material.color = new THREE.Color('#b25e41');
	// huizhang.material.specular = new THREE.Color().setHSL( HSL.h, HSL.s, HSL.l ); //反射色值
	// huizhang.material.reflectivity = 1; //反射率
	// huizhang.material.shininess = 30; //shininess发亮

	//翅膀
	const chibang = this.object.getObjectByName('chibang');
	var HSL = new THREE.Color( '#ff8851' ).getHSL({ h: 0, s: 0, l: 0 });
	HSL.s *= 0.5;
	chibang.material.color = new THREE.Color('#ff8851');
	// chibang.material.specular = new THREE.Color().setHSL( HSL.h, HSL.s, HSL.l ); //反射色值
	// chibang.material.reflectivity = 1; //反射率
	// chibang.material.shininess = 30; //shininess发亮

	//sidai
	const sidai = this.object.getObjectByName('sidai');
	var HSL = new THREE.Color( '#a65646' ).getHSL({ h: 0, s: 0, l: 0 });
	HSL.s *= 0.5;
	sidai.material.color = new THREE.Color('#a65646');
	// sidai.material.specular = new THREE.Color().setHSL( HSL.h, HSL.s, HSL.l ); //反射色值
	// sidai.material.reflectivity = 1; //反射率
	// sidai.material.shininess = 30; //shininess发亮

	//shangjiao
	const shangjiao = this.object.getObjectByName('shangjiao');
	var HSL = new THREE.Color( '#ff8851' ).getHSL({ h: 0, s: 0, l: 0 });
	HSL.s *= 0.5;
	shangjiao.material.color = new THREE.Color('#ff8851');
	// shangjiao.material.specular = new THREE.Color().setHSL( HSL.h, HSL.s, HSL.l ); //反射色值
	// shangjiao.material.reflectivity = 0.5; //反射率
	// shangjiao.material.shininess = 30; //shininess发亮

	//baoshi
	const baoshi = this.object.getObjectByName('baoshi');
	var HSL = new THREE.Color( '#aa4b3d' ).getHSL({ h: 0, s: 0, l: 0 });
	HSL.s *= 0.5;
	baoshi.material.color = new THREE.Color('#aa4b3d');
	// baoshi.material.specular = new THREE.Color().setHSL( HSL.h, HSL.s, HSL.l ); //反射色值
	// baoshi.material.reflectivity = 0.5; //反射率
	// baoshi.material.shininess = 30; //shininess发亮

	//sanjiao3
	const sanjiao3 = this.object.getObjectByName('sanjiao3');
	var HSL = new THREE.Color( '#e1d694' ).getHSL({ h: 0, s: 0, l: 0 });
	HSL.s *= 0.5;
	sanjiao3.material.color = new THREE.Color('#e1d694');
	// sanjiao3.material.specular = new THREE.Color().setHSL( HSL.h, HSL.s, HSL.l ); //反射色值
	// sanjiao3.material.reflectivity = 0.5; //反射率
	// sanjiao3.material.shininess = 30; //shininess发亮

	//sanjiao2
	const sanjiao2 = this.object.getObjectByName('sanjiao2');
	var HSL = new THREE.Color( '#e1d694' ).getHSL({ h: 0, s: 0, l: 0 });
	HSL.s *= 0.5;
	sanjiao2.material.color = new THREE.Color('#e1d694');
	// sanjiao2.material.specular = new THREE.Color().setHSL( HSL.h, HSL.s, HSL.l ); //反射色值
	// sanjiao2.material.reflectivity = 0.5; //反射率
	// sanjiao2.material.shininess = 30; //shininess发亮

	//sanjiao1
	const sanjiao1 = this.object.getObjectByName('sanjiao1');
	var HSL = new THREE.Color( '#e1d694' ).getHSL({ h: 0, s: 0, l: 0 });
	HSL.s *= 0.5;
	sanjiao1.material.color = new THREE.Color('#e1d694');
	// sanjiao1.material.specular = new THREE.Color().setHSL( HSL.h, HSL.s, HSL.l ); //反射色值
	// sanjiao1.material.reflectivity = 0.5; //反射率
	// sanjiao1.material.shininess = 30; //shininess发亮


	//

	// var HSL = new THREE.Color( color ).getHSL({ h: 0, s: 0, l: 0 });
	// HSL.s *= 0.5;

	// //上色
	// for(var i=0; i<8; i++){
	// 	var ribbon = this.object.getObjectByName('sidai_'+(i+1));
	// 	if(!ribbon) return;

	// 	ribbon.material.color = new THREE.Color( color );
	// 	ribbon.material.specular = new THREE.Color().setHSL( HSL.h, HSL.s, HSL.l ); //反射色值
	// 	ribbon.material.reflectivity = 0.5; //反射率
	// 	ribbon.material.shininess = 30; //shininess发亮
	// }
}

Medals.prototype.setText = function(text){

	var loader = new THREE.FontLoader();
	loader.load( '../models/fonts/fang.json', function ( response ) {

		let	height = 12,
			size = 60,
			hover = -238,
			textMesh1 = null,

			curveSegments = 4,
			bevelThickness = 2,
			bevelSize = 1.5,
			bevelSegments = 3,
			bevelEnabled = true,

			font = response;

		let materials = [
			new THREE.MeshPhongMaterial( { color: 0x959faf, flatShading: true } ), // front
			new THREE.MeshPhongMaterial( { color: 0xfeffff } ) // side
		];


		const  textGeo = new THREE.TextGeometry( text, {

			font: font,
			size: size,
			height: height,
			curveSegments: curveSegments,

			bevelThickness: bevelThickness,
			bevelSize: bevelSize,
			bevelEnabled: bevelEnabled

		});

		textGeo.computeBoundingBox();
		textGeo.computeVertexNormals();

		textMesh1 = new THREE.Mesh( textGeo, materials );

		const centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
		textMesh1.position.x = centerOffset;
		textMesh1.position.y = hover;
		textMesh1.position.z = 40;

		this.object.add( textMesh1 );


		//添加阴影
		this.object.traverse( function ( child ) {

			if ( child.isMesh ) {

				if(!child.getObjectByName('huizhang')){
					child.castShadow = true;
					child.receiveShadow = true;
				}

			
				//重置金属材质
				child.material = new THREE.MeshStandardMaterial({
                    color:child.material.color,
                    //reflectivity:0, //反射率 默认1  不适用该材质
                    refractionRatio:0,//环境贴图折射率 默认0.98
                    roughness: .5, //粗糙程度 0镜面 1完全扩散 默认0.5
                    //roughnessMap:texture2,//与 粗糙程度相乘
                    metalness:.7, //金属1 塑料0 默认0.5
                    //metalnessMap:texture2,// 金属贴图和金属属性相乘
                    //wireframe:true //测试线框
                });
			}

		});

		this.scene.add( this.object );

	}.bind(this));

}

//设置纹理
Medals.prototype.setTexture = function(url_arr,callback){


	if(!this.object) return;

	var self = this;
	var url = url_arr[0];

	var box1 = self.object.getObjectByName('hezi');
	var box2 = self.object.getObjectByName('gaizi_1');
	var box3 = self.object.getObjectByName('gaizi_2');

	self.len = url_arr.length;

	var textureloader1 = new THREE.TextureLoader();

	textureloader1.load(url,function(texture){
		var texture = texture;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1);							
		box1.material.map = texture;
		box1.material.needsUpdate = true;
		if(self.len!=3){				
			box3.material.map = texture;
			box3.material.needsUpdate = true;
		}
	});

	//异化
	if( self.len === 3 ){
		url = url_arr[2];
	}

	//盒盖侧身
	var textureloader2 = new THREE.TextureLoader();
	textureloader2.load(url,function(texture){
		var texture = texture;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		texture.repeat.set( 1.01, 0.36);
		if( self.len === 3 ){
			texture.repeat.set( 1, 1);	
		}
		texture.offset.x = 0.0094;

		box2.material.map = texture;
		box2.material.needsUpdate = true;	

		//回调函数
		callback && callback();
	});

	//异化
	if( self.len === 3 ){

		//盒盖
		url = url_arr[1];

		var textureloader3 = new THREE.TextureLoader();
		textureloader3.load(url,function(texture){
			var texture = texture;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( 1, 1);							
			box3.material.map = texture;
			box3.material.needsUpdate = true;	
		});
	}

}

//加载模型
Medals.prototype.loadModel = function(callback){

	var loader = new THREE.FBXLoader();
	loader.load( this.model_url , function ( object ) {
		callback && callback(object);
	} );	

}

Medals.prototype.remove = function(){
	this.scene.remove( this.object );
	this.obj.removeChild( this.renderer.domElement );
}

//设置盒子类型
Medals.prototype.setType = function(num){
	this.type = parseInt(num);
}

Medals.prototype.animate = function(){

	requestAnimationFrame( this.animate.bind(this) );

	//物体回正
	this.ani_back();

	if(this.finger_move){

        this.theta = THREE.Math.degToRad( this.lon );

        // $('.txt2').html( this.lon.toFixed(2) );

        //缓冲运动 速度 = （目标 - 当前）/ 摩擦系数
        this.object.rotation.y += (this.theta - this.object.rotation.y) * 0.15 ;  

	}

	this.renderer.render( this.scene, this.camera );

}

//***** 物体回正 *****//
Medals.prototype.ani_back = function(){

	//抬起时算出需要回正的度数
	if(this.up_flag && this.first_flag){
		this.first_flag = false;
        if( Math.abs(this.lon % 180) > 90 ){
            if(this.lon<0){
                this.disx = - 180 - this.lon % 180 ;
            }else{
                this.disx = 180 - this.lon % 180;
            }
        }else{
            this.disx = -this.lon % 180; 
        }

        this.target_lon = this.disx + this.lon + this.p.g ;

        // $('.txt3').html( this.p.g.toFixed(2) );

        console.log(this.target_lon,this.disx , this.lon)
	}

	//缓冲运动结束时开启回正方法
    if(Math.abs(this.theta - this.object.rotation.y)<=0.01 && this.up_flag){
    	this.up_flag = false;
    	this.first_flag = true;
        this.ani_another = true;
    }

    //回正方法开启
    if(this.ani_another){
		this.speed += ( this.target_lon - this.lon) / 60;  
		this.speed *= this.speed_normal ;
		this.speed_normal -= 0.005;
		if(this.speed_normal < 0.95){
			this.speed_normal  = 0.95;
		}
		if( Math.abs(this.speed )<=1 && Math.abs( this.target_lon - this.lon )<=1 ){
			this.ani_another = false;
			this.lon = this.target_lon;
			this.speed = 0;
			this.speed_normal  = 0.98;
		}else{
			this.lon += this.speed ; 
		}  	
    }
}

//添加旋转事件
Medals.prototype.onDocumentMouseDown = function(ev){
	this.up_flag = false;
	this.ani_another = false;
	this.first_flag = true;
    this.prex = ev.touches[0].clientX; 
    this.prey = ev.touches[0].clientY;  

}

Medals.prototype.onDocumentMouseMove = function(ev){

    ev.preventDefault();

    //速度（偏移量）
    // this.speedx = (ev.touches[0].clientX - this.prex) * 0.5;
    this.speedx = (ev.touches[0].clientX - this.prex) * Math.max(Math.abs((ev.touches[0].clientX - this.prex)),8) * 0.05;

    this.lon+=this.speedx;
	this.prex = ev.touches[0].clientX;
}

Medals.prototype.onDocumentMouseUp = function(ev){
	this.up_flag = true;
}

//添加重力感应
Medals.prototype.gravFn = function(){

	var self = this;

    //重力感应
    this.p.o = new Orienter();
    this.p.pre_g = 0; 

    this.p.o.handler = function (obj) {
        //经度 obj.lon
        //纬度 obj.lat

		if( this.ani_another || !this.first_flag ) return;

        this.p.g = obj.g;

        // $('.txt1').html( this.p.g.toFixed(2) );

        if(this.p.g > 60){
            this.p.g = 60;
        }else if(this.p.g < -60){
            this.p.g = -60;
        }
        this.p.g = this.p.g/1.5;

        //防止越界
        if( Math.abs(this.p.g - this.p.pre_g) > 10 ){  //90°临界点
            this.p.g *= -1;
        }

        self.lon += this.p.g - this.p.pre_g;
        this.p.pre_g = this.p.g;

    }.bind(this);

    this.p.o.init();
}
