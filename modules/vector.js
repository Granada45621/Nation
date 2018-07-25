class Vector {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}

	Set(num) {
		if (Array.isArray(num)) {
			this.x = num[0];
			this.y = num[1];
		} else {
			this.x = num.x;
			this.y = num.y;
		}
		return this;
	}

	Sub(num) {
		if (Array.isArray(num)) {
			this.x -= num[0];
			this.y -= num[1];
		} else {
			this.x -= num.x;
			this.y -= num.y;
		}
		return this;
	}

	Add(num) {
		if (Array.isArray(num)) {
			this.x += num[0];
			this.y += num[1];
		} else {
			this.x += num.x;
			this.y += num.y;
		}
		return this;
	}

	Mul(num) {
		if (Array.isArray(num)) {
			this.x *= num[0];
			this.y *= num[1];
		} else {
			this.x *= num.x;
			this.y *= num.y;
		}
		return this;
	}

	Div(num) {
		if (Array.isArray(num)) {
			this.x /= num[0];
			this.y /= num[1];
		} else {
			this.x /= num.x;
			this.y /= num.y;
		}
		return this;
	}

	Set_Random(xmin, xmax, ymin, ymax) {
		this.x = Math.floor(Math.random() * (xmax - xmin)) + xmin;
		this.y = Math.floor(Math.random() * (ymax - ymin)) + ymin;
		return this;
	}

	Set_Int() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}

	Set_Move(speed, direction) {
		this.x += ((speed) * (Math.cos(direction)));
		this.y += ((speed) * (Math.sin(direction)));
		return this;
	}

	Set_MoveCos(speed, direction) {
		this.x += ((speed) * (Math.cos(direction)));
		return this;
	}

	Set_MoveSin(speed, direction) {
		this.y += ((speed) * (Math.sin(direction)));
		return this;
	}

	Get_Distance(vec) {
		return Math.hypot(this.x - vec.x, this.y - vec.y);
	}

	Get_Direction(vec) {
		return Math.atan2(vec.y - this.y, vec.x - this.x);
	}

	Get_String() {
		return this.x+" "+this.y;
	}

	Get_Clone() {
		return new Vector(this.x, this.y);
	}

	Check_Range(xmin, xmax, ymin, ymax) {
		return (this.x >= xmin && this.x < xmax && this.y >= ymin && this.y < ymax);
	}

	Check_Same(vec) {
		return (this.x == vec.x && this.y == vec.y);
	}
}

try {
	module.exports = Vector;
} catch(e) {
	var a;
}