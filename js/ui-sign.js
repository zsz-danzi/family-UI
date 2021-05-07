/*==============================
 * Project: 空间家族
 * Description: 签到动画-辅助
 * @author: danzizhong
 * Time：2018.09.03
=================================*/
let Sign = {

	init : function(day){

		const W = window.innerWidth;
		let box1 = null;
		if(day == 7){
			box1 = $('.sign-panel .item-name').eq(day)[0];
		}else{
			box1 = $('.sign-panel .item-img').eq(day)[0];
		}
		const box2 = $('.reward-ani')[0];

		const box1_w = W * 0.133333;
		const box2_w = 280;

		//物体1位置信息
    	let posA_1 = this.getPos(box1);
    	if(day == 7){ 
    		posA_1.x += 50; 
    		posA_1.y += 30; 
    	}
    	let posA_2 = {
    		x : posA_1.x + box1_w,
    		y : posA_1.y
    	};
    	let posA_3 = {
    		x : posA_1.x,
    		y : posA_1.y + box1_w	
    	}

    	//物体2位置信息
    	let posB_1 = this.getPos(box2);
    	let posB_2 ={
    		x : posB_1.x + box2_w,
    		y : posB_1.y
    	}
    	let posB_3 ={
    		x : posB_1.x,
    		y : posB_1.y + box2_w
    	}

    	const k1 =  (posB_2.y - posA_2.y)/(posB_2.x - posA_2.x);
    	const b1 =  posB_2.y - k1 * posB_2.x;

    	const k2 =  (posB_3.y - posA_3.y)/(posB_3.x - posA_3.x);
    	const b2 =  posB_3.y - k2 * posB_3.x;

    	let point = {};
    	point.x = (b1 - b2) / ( k2 - k1);
    	point.y = point.x * k1 + b1;

    	const p1 = ((point.x - posB_1.x) / box2_w*100).toFixed(3);
    	const p2 = ((point.y - posB_1.y) / box2_w*100).toFixed(3);

    	$('.sign-reward .reward-ani')[0].style.cssText = '-webkit-transform-origin:'+p1+'% '+p2+'%;';
	},

	getPos : function(obj){

		var pos = {
			x : 0,
			y : 0
		};
		while(obj){
			pos.x += obj.offsetLeft;
			pos.y += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return pos;

	}
};