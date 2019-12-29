[english](readme.md)
中文

# 简介
​cauto类似于python的pyautogui，但cauto使用c语言开发，目前支持以下操作：
* 模拟键盘按键点击
* 模拟鼠标按键点击
* 模拟鼠标的移动
* 模拟鼠标滚轮滚动
* 可以在屏幕上查找图片的位置

>目前只支持windows环境

# 编译环境

1. 下载mingw

   [mingw官网下载](https://sourceforge.net/projects/mingw-w64/files/latest/download)

   [codeblock](http://www.codeblocks.org/downloads/26)
或者下载codeblock，带gcc编译器的（codeblocks-17.12mingw-setup.exe）

2. 添加环境变量
3. 在命令行中执行以下命令，并有对应提示表示配置成功

```
E:\git_rep\applib\cauto>gcc -version
gcc (x86_64-posix-seh-rev0, Built by MinGW-W64 project) 8.1.0
Copyright (C) 2018 Free Software Foundation, Inc.
```

4. 下载源码并编译

```
E:\git_rep\applib\cauto>make.bat
```

5. 执行编译生成的test程序

```
E:\git_rep\applib\cauto>test.exe
usrp 2019.12.29 10:00:39.15 debug: init
usrp 2019.12.29 10:00:39.22 debug: width: 1920 hight:1080
```


# 使用方法

api 在app_api.h文件中

## 按键
* 按下按键
```
	key_down(KEY_A);
```
* 松开按键
```
	key_up(KEY_A);
```
* 单击
```
	key_click(KEY_A);//模拟按键 A
	key_shift(KEY_B);//模拟按键 ctrl + B
	key_alt(KEY_A);//模拟按键 alt + A
	key_ctl(KEY_A);//模拟按键 ctrl + A
```

* 双击
```
	double_click(KEY_A);
```
* 多击
```
	key_clicks_mul(KEY_A, 5, 0);//模拟按键A 5次，间隔0毫秒
```
* 多个按键
```
	key_num_t ctrl_k[] = {KEY_CTRL, KEY_A};
	mul_keys_click(ctrl_k, sizeof(ctrl_k)/sizeof(key_num_t), 0);//间隔0毫秒
	/*等效于*/
	key_down(KEY_CTRL);
	key_down(KEY_A);
	key_up(KEY_A);
	key_up(KEY_CTRL);
```
## 鼠标
* 按键（操作方法同键盘按键）
	* KEY_MOUSE_L(左键) 
	* KEY_MOUSE_M（中间按键） 
	* KEY_MOUSE_R（右键）

```
	key_click(KEY_MOUSE_L);// 单击鼠标左键
```
* 移动
>坐标系说明：左上角坐标为（0,0）， 向右，x坐标增加， 向下，y坐标增加
```
	pos_t cur;
	mouse_move(100, 100);// 鼠标移动到（x=100,y=100）
	mouse_get(&cur);// 获取当前鼠标坐标
```
* 滚轮
```
	mouse_wheel(100); // up 100
	mouse_wheel(-100);// down 100
```
# 图像
* 找图像
```
	u32 cnts;
	int i;

/* 
	查找7.bmp图像,返回查找到的个数及坐标
	0.99 表示相似度
	NULL，查找的区域传入空，表示全屏查找
*/
	cnts = find_img("7.bmp", 0.99, NULL);

	M_INFO("cnts:%u\n", cnts);
	for(i = 0; i < cnts; i ++) {
		M_INFO("x:%u y:%u\n", find_res[i].x, find_res[i].y);
	}
```
* 查找，并点击图像
```
	click_img("=.bmp", 0.99, NULL);
```
