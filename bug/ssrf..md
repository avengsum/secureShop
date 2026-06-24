## SSRF working

 - so ssrf vulbilityy so smajete h so ssrf matlla ye nahi h ki hum 
 aws metadata mil gya toh ssrf h haan matlab sirf aws hi ssrf nahi h

- so ssrf me hum server ki network prvialge ka use karke aisa data niklate h jise hum normal privalged se access nahi kar skte

- like hum facebook.com ke localhost se baat nahi kar skate becuase woh public internet pe nahi h becsuae woh facebook ke internal netwrok m h jise sirf facebook ke server access kar skte h so ssrf ki help se hum facebook server ki network privalage se hum localhsot ko access kr skate h

- so aws examplse se samjte so agr tum breoser me ye url hit karte ho
169.254.169.254 to tum access nahi kr skte because ye url public internet pe nahi h because ye ek private network h jise aws own karta h

- so jb hum aws pe ek e2c instnace bante h toh woh hume metadata serivce deta h jiska url ye h 169.254.169.254 so isko hum normal se acceess nahi kr skate because ye sirf internal network ko hi access krne deta like woh website host hue ho kyuki woh aws pe h so woh trust
kr skate h so ssrf se hum metadat niak skate h  
![alt text](image.png)

- what if website clound pe store nah hi ho still hum access kr skte h using local hsot so local hsot ki waajh se hum jenkis redis ko access kr skte h aur bhi intenal services ko acces kr skte h jise sirf woh server hi access kr pata 


## blind ssrf

- so blind ssrf pe hume request to ata h but resposne anhi dikata hum confirm kar skte h blind ssrf using burp collaborator

## blind ssrf working

- so tumne socha h kabhi ki blind ssrf ki working kya h woh hota hi kyu h matlab ki resposne m text kyu nahi de raha h aaj m tume show krta hu  kaise 

- so suppose developer ko aisa feature banana h jise woh repsose to get na karte but ye pata chal jae use ki haan request ya conncetion success full like staus of something so in sb feature  me blind ssrf ata h kyuko woh sirf kuch connection ya phir kuch bhi deta h but resposse nahi dete  like  code

![alt text](image-3.png)

## blind how to know 

- so agr repsonse hi nahi de raha h to pata kaise chalega ki kuch hua h so isko test karne ke hume apan ek khud a server chaiye jise hum control kare burp collabertor

- so hum url dalege agr hit hua toh like reosnse show nahi kiya but dns resolved still this is major sign that ssrf is there so this can be only thing 

- example of ssrf finding 

![alt text](image-4.png)

## blind ssrf metholdgy 

- so first confirm using burp collaobrator

- try to hit localhsot 

![alt text](image-1.png)

- try to find open ports in the website
- after fnnd what service running on the port
- now look for high value services

## blind ssrf behaves while access port
![alt text](image-2.png)

- so first port 200 ms means this service is listing and it is an open port 

- so secodn is 30 seconds internist so it menas that rquest goes aand take time it can mena anything like firewall ne drop kr diya ya phir request proper nahi this jis format me us service ko chaiye so ye intresting h

- so  third one means that the port is cloesd and no body is listing 


## whiltist bypass portswigger one by path confusion(# @)

``` http://localhost:80#@stock.weliketoshop.net/admin/delete?username=carlos ```

- so using this we will understand 
- so jb whitelist like something setup kiya jata h toh ek validator laya jata h jise hume bypass karna hota

- so suppose the validator give like allow only stock.weliketoshop.net host so yes host name hi hona chaiye so

- so ise bypass karne ke liye hum @ use karege 

- so @ crendtali ke liye use hota h like 
![alt text](image-5.png)

so ye exxmaple h @ ka 

- 
![alt text](image-6.png)

- so @ se pehle crentidials h aur @ ke baad host hota h so  http://localhost@stock.net dalege toh bypass ho jaega kyuki use lagea ki ohh ye toh stock hi h host so bypass 

- but request jaega nahi kyuki validator todi request bej raha h woh toh http client bej raha h woh to stock pe hi bejega kyuki @ host woh hi h

- so ab hume ise bypass karna hai ise hum # se kr skte h # menas ki framgemt so ki ignore kr dena h like /post#id=1 so post pe hi jaega request na ki /post#id=1 so remeber that

- so @ validator ko bypass kara diya aur # http ko isliye ye request work kr gya
