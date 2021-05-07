/*
 * @author:danzizhong;
 * @date:2018/03/16;
 * @content:排行榜-particle;
*/

/*2D 粒子效果*/
var Particle = {

	init : function( player , s){

        var _this = this;

        //获取画布DOM 还不可以操作
        this.cvs = document.getElementById('cvs');
        //设置绘图环境  这个重要  
        this.ctx = this.cvs.getContext('2d');

        this.W = 288;
        this.H = 552;
        this.cvs.width = this.W;
        this.cvs.height = this.H;


        function Parti(opt){
            this.x = opt.x;
            this.y = opt.y;

            this.width = 10; 
            this.height = 10; 

            this.scale = opt.scale;

            this.img = new Image();
            this.img.src = opt.url;
        }
        Parti.prototype = {
            consttructor : Parti,
            draw : function(ctx){

                if(this.img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数  
                    this.ondraw(ctx);
                    return; // 直接返回，不用再处理onload事件  
                }  
                var _this = this;    
                this.img.onload = function(){
                    _this.ondraw(ctx); 
                } 
            },
            ondraw : function(ctx){
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.drawImage(this.img, this.x, this.y ,this.width*this.scale, this.height*this.scale );
                ctx.restore(); 
            }
        }


        var particle = [];

        this.load('../img/rank/particle_w.png',function(img){

            for (var i = 0; i < 40; i++) {
                particle = new Parti({
                    url : '../img/rank/particle_w.png',
                    x : 1,
                    y : 1,
                    scale : 1
                });
                _this.initParticle(particle, i*450);

            }

            _this.animate();
        });



	},

    load : function(imgUrl,endFn){
        var img = new Image();
        img.onload = endFn(img);
        img.src = imgUrl;
    },

    initParticle : function(particle , delay){
        var _this = this;
        particle.myPosition = [Math.random() * (this.W - 44) + 22 , this.H - 170 - Math.random()*30];
        particle.scaleTemp = Math.random() + .5;
        particle.scale = 0;
        particle.myFactor = Math.random() >= 0.5 ? 1 : -1;
        particle.myOffset = Math.random() * 26 + 8 ;

        particle.opacity = Math.random()/1.6 + .4;


        //30% 的粒子不移动
        if( Math.random() <=  0.25 ){
            // particle.myOffset = 0;
        }


        particle.myXStep =  Math.random() / 4  + 0.1 ;
        particle.myYStep = Math.abs( Math.random()*2+1)/2;

        particle.x = particle.myPosition[0];
        particle.y = particle.myPosition[1];

        // particle.set(particle.myPosition[0], particle.myPosition[1], particle.myPosition[2] );
        // particle.scale.set( 0,0,0 );
        particle.obj = {x: 0};

        new TWEEN.Tween(particle.obj)
            .to({x: 5000}, 5000)
            .delay( delay )
            .easing( TWEEN.Easing.Quadratic.In ) //Quadratic, Cubic, Quartic, Quintic, Sinusoidal, Exponential, Circular, Elastic, Back 和 Bounce 删掉就是linear
            .onUpdate(function() {

                // 位移动画
                particle.myFactor = particle.x >= particle.myPosition[0]+particle.myOffset ? -1 : particle.myFactor;
                particle.myFactor = particle.x < particle.myPosition[0]-particle.myOffset ? 1 : particle.myFactor;
                particle.x = particle.x + particle.myFactor * particle.myXStep;
                particle.y -= particle.myYStep;

                if (particle.obj.x >= 0 && particle.obj.x <= 1500 && particle.scale < particle.scaleTemp) {
                    particle.scale += .05;
                    // particle.scale.set( particle.scaleTemp,particle.scaleTemp,particle.scaleTemp );
                }
                else if (particle.obj.x > 3400) {

                    particle.scale = particle.scale - 0.05;
                    particle.scale = particle.scale <= 0 ? 0 : particle.scale;
                    // particle.scale.set( particle.scale, particle.scale ,particle.scale );
                }
                // console.log( particle,_this.ctx )
                particle.draw( _this.ctx );

            })
            .onComplete(function(){
                _this.initParticle(particle, delay);
            })
            .start();

    },

    animate : function(time){
        this.ctx.clearRect(0,0,this.W,this.H);

        TWEEN.update( time );


        requestAnimationFrame( this.animate.bind(this) );   
    }

};

