const rad = Math.PI / 180;

const score = document.getElementById("score");
const ss = score.style;
ss.backgroundColor = ("#44a4ce");
ss.width = ("796px");
ss.height = ("40px");
ss.fontSize = ("30px");
ss.padding = ("5px 0 5px 0");
ss.display = ("flex");
ss.justifyContent = ("center");
ss.borderStyle = ("solid");
ss.borderWidth = ("2px");
ss.borderRadius = ("20px 20px 0 0");
score.innerHTML = '<div id="HP">HP :</div><div id="HPcount">100</div><div id="HPmax">/100</div><div id="sco">score :</div>';

const max = document.getElementById("HPmax");
max.style.minWidth = ("200px");

const HPc = document.getElementById("HPcount");
const Hcs = HPc.style;
Hcs.minWidth = ("60px");
Hcs.textAlign = ("right");

const sco = document.getElementById("sco");
sco.style.minWidth = ("250px");

const cav = document.getElementById("canvas");
const ctx = cav.getContext('2d');
const C = {
  W : cav.width,
  H : cav.height,
  Wh : cav.width / 2,
  Hh : cav.height / 2
}

const BeamCav = document.createElement("canvas");
BeamCav.width = C.W;
BeamCav.height = C.H;
const Bctx = BeamCav.getContext('2d');

const spawnP = {
  top : {
    R : { x : C.W, y : 0 },
    M : { x : C.Wh, y : 0 },
    L : { x : 0, y : 0 }
  },
  mid : {
    R : { x : C.W, y : C.Hh },
    L : { x : 0, y : C.Hh }
  },
  und : {
    R : { x : C.W, y : C.H },
    M : { x : C.Wh, y : C.H },
    L : { x : 0, y : C.H }
  }
}

const AbilitySpawn = [
  ["top","R"],
  ["top","M"],
  ["top","L"],
  ["mid","R"],
  ["mid","L"],
  ["und","R"],
  ["und","M"],
  ["und","L"]
]

const angleToKey = {
  0   : ["R","mid"],
  45  : ["R","und"],
  90  : ["M","und"],
  135 : ["L","und"],
  180 : ["L","mid"],
  225 : ["L","top"],
  270 : ["M","top"],
  315 : ["R","top"],
}

const BG = new Image();
BG.src = `ちょっと画像/BackGround.jpg`;

const Images = {
  topSp : ['FireBird','IceBird','FoolBird','letterBird'],
  midSp : ['FlyDog', 'runner','hippo','deer','Tsaurus'],
  undSp : ['runner', 'pachy','turtle','togari','capy'],
};
const PlImgs = ['Body', 'Head'];
const StatusImgs = ['Ice','Fire','palsy'];
const BeamImgs = ['Beam','BeamHit']

let imageLength = 0;
for (const [key, img] of Object.entries(Images)) {
  imageLength += img.length;
}

const game = {
  gameCounter : 0,
  enemys : [],
  beams : [],
  image : {},
  PlImage : {},
  StatusImage : {},
  BeamImage : {},
  Over : false,
  score : 0,
  timer : null,
  beam : null,
}

let enemyL = false;
let playeL = false;

let imgLC = 0;
for (const [key, imgs] of Object.entries(Images)) {
  game.image[key] = [];
  let i = 0;
  for (const img of imgs) {
    const imgsrc = `ちょっと画像/${img}.png`;
    game.image[key].push({ [img] : new Image() });
    game.image[key][i][img].src = imgsrc;
    game.image[key][i][img].onload = () => {
      imgLC++;
      if (imgLC === imageLength) {
        enemyL = true;
        if (playeL) {
          Start();
          addStatus();
          
          //console.log(enemyStatus);
        }
      }
    }
    i++;
  }
}

let PlimgLC = 0;
for (const img of PlImgs) {
  const imgsrc = `ちょっと画像/player/${img}.png`;
  game.PlImage[img] = new Image();
  game.PlImage[img].src = imgsrc;
  game.PlImage[img].onload = () => {
    PlimgLC++
    if (PlimgLC === PlImgs.length) {
      playeL = true;
      if (enemyL) {
        Start();
        addStatus();
        
        //console.log(enemyStatus);

        for (const [E,st] of Object.entries(enemyStatus)) {
          ERateList[E] = st.rate;
        }
        console.log (ERateList)
      }
    }
  }
}

const ERateList = {};

for (const img of StatusImgs) {
  const imgsrc = `ちょっと画像/Status/${img}.png`;
  game.StatusImage[img] = new Image();
  game.StatusImage[img].src = imgsrc;
}

for (const img of BeamImgs) {
  const imgsrc = `ちょっと画像/Beam/${img}.png`;
  game.BeamImage[img] = new Image();
  game.BeamImage[img].src = imgsrc;
}

let enemyStatus = {};

const BadStatus = {
  IceCount : 0,
  FireCount : 0,
  PalsyCount : 0,
}

//--------------------------------------------------------
const SPPCool = 3;         //場所ごとのクールタイム(秒)
const SPcooldown = 1;      //全体のクールタイム(秒)
const SPprobability = 1.5;  //スポーン確率(一秒に分の１)

let BeamFrequency = 0.3; //攻撃頻度(秒)

function clock() {
  ctx.clearRect(0, 0, C.W, C.H);

  create();

  moveEnemy();

  damageCheck();

  drawBG();

  drawBeam();

  gameOverChecker();

  drawPlayer();
  drawEnemy();

  ScoreUpdate();

  //debag();

  clockAbility();

  clearChecker();

  if (BadStatus.IceCount > 0) BadStatus.IceCount--;
  if (BadStatus.FireCount > 0) BadStatus.FireCount--;
  if (BadStatus.PalsyCount > 0) BadStatus.PalsyCount--;
}

document.onkeydown = (e) => {
  if (e.code === 'ShiftLeft' && !game.Over) {
    PlayRotate(-1);
  }
  if (e.code === 'ShiftRight' && !game.Over) {
    PlayRotate(1);
  }
  if (e.code === 'Enter' && game.Over) {
    Start();
  }
}
//--------------------------------------------------------
//------↓関数-----------

function debag() {
  for (const E of game.enemys) {
    E.HP = 0;
  }

  if (game.score >= 30000) {
    game.P.HP = 0;
  }
}

function clockAbility() {
  for (const enemy of game.enemys) {
    enemy.clockAbility(enemy);
  }
}

function clearChecker() {
  if (game.score >= 30001) {
    ctx.font = ('bold 100px serif');
    ctx.fillStyle = ('#de240c');
    ctx.fillText('Game Clear!',90,250);

    ctx.strokeStyle = ('black');
    ctx.lineWidth = 4;
    ctx.strokeText('Game Clear!',90,250);

    game.Over = true;

    clearInterval(game.beam);
    clearInterval(game.timer);
  }
}

function gameOverChecker() {
  if (game.P.HP <= 0) {
    ctx.font = ('bold 100px serif');
    ctx.fillText('Game Over!',90,250);

    game.Over = true;

    clearInterval(game.beam);
    clearInterval(game.timer);

    console.log(SPCount);
  }

  //console.log("gameOverChecker()")
}

function drawBG() {
  ctx.drawImage(BG, 0, 0);

  //console.log("drawBG()")
}

function drawBeam() {
  Bctx.clearRect(0,0,C.W,C.H);

  for (const B of game.beams) {
    Bctx.translate(C.Wh,C.Hh);
    Bctx.rotate(B.angle * rad);

    Bctx.scale(1, B.flip);

    if (B.Clear) Bctx.drawImage(B.image,B.x,B.y);

    if (B.Clear) Bctx.clearRect(B.Clear,-B.H,C.W,B.H * 2);

    if (!B.Clear) Bctx.drawImage(B.image,B.x,B.y);

    drawBeamHit(B);

    Bctx.clearRect(-B.W,-B.y,B.W * 1.11,B.H);

    Bctx.setTransform(1,0,0,1,0,0);

    B.x += B.speed;
    B.BeamHitCount--;
  }

  game.beams = game.beams.filter(B => B.x < 900 && !(B.BeamHitCount <= 0 && B.Clear));

  ctx.drawImage(BeamCav,0,0);
  
  //console.log("drawBeam()")
}

BeamPalsy = false;

function Beam() {
  const BmAngle = AngleCount;

  game.beams.push({
    x : -game.BeamImage.Beam.width  / 1.2,
    y : -game.BeamImage.Beam.height / 8,

    W  : game.BeamImage.Beam.width,
    H  : game.BeamImage.Beam.height,
    Wh : game.BeamImage.Beam.width  / 2,
    Hh : game.BeamImage.Beam.height / 2,

    image : game.BeamImage.Beam,
    HitImg: game.BeamImage.BeamHit,

    angle : BmAngle,

    speed : 12,

    Clear : false,

    BeamHitCount : 0,

    flip : flip,
  });

  if (BadStatus.PalsyCount > 0) {
    clearInterval(game.beam);
    game.beam = setInterval(Beam, BeamFrequency * 1400);
    BeamPalsy = true;

  } else if (BeamPalsy) {
    clearInterval(game.beam);
    game.beam = setInterval(Beam, BeamFrequency * 1000);
    BeamPalsy = false;
  }
  
  //console.log("Beam()")
}

function drawBeamHit(B) {
  if (B.BeamHitCount > 0) {
    //Bctx.clearRect(B.Clear,-C.Hh,B.W,B.H);
    Bctx.drawImage(B.HitImg,B.Clear,-B.HitImg.height / 2);
  }

  //console.log("drawBeamHit()")
}


function damageCheck() {
  if (BadStatus.FireCount % 20 === 1) game.P.HP--;

  //console.log("damageCheck()")
}

function ScoreUpdate() {
  game.score++

  if (game.P.HP < 0) game.P.HP = 0;

  sco.innerHTML = 'score : ' + Math.floor(game.score / 3);
  HPc.innerHTML = game.P.HP;

  //console.log("ScoreUpdate()")
}

function drawEnemy() {
  for (const enemy of game.enemys) {

    if (enemy.Xrml !== "L") {
      ctx.drawImage(enemy.image, enemy.x, enemy.y); 
    } else {
      ctx.scale(-1,1);
      ctx.drawImage(enemy.image, enemy.x, enemy.y);
      ctx.setTransform(1,0,0,1,0,0);
    }

  }

  //console.log("drawEnemy()")
}

function moveEnemy() {

  for (const Ene of game.enemys) {
    Ene.x += Ene.moveX * Ene.speed;
    Ene.y += Ene.moveY * Ene.speed;
  }

  for (const enemy of game.enemys) {
    if (hitCheck(enemy)) {
      enemy.hitAbility(enemy);
    }

    if (BeamHitCheck(enemy)) {
      enemy.HP -= 1;
      enemy.shotAbility(enemy);
      if (enemy.HP <= 0) {
        enemy.deadAbility(enemy);
      }
    }
  }

  game.enemys = game.enemys.filter(enemy => !hitCheck(enemy) && enemy.HP > 0);

  //console.log("moveEnemy()")
}

function BeamHitCheck(enemy) {
  let hit = false;

  const Erml = [enemy.Xrml,enemy.Yrml];

  let ENEx = (enemy.x + enemy.Wh);

  if (Erml[0] === "L") {
    ENEx *= -1;
  }

  const PExdis = Math.abs((game.P.x + game.P.Wh) - ENEx);
  const PEydis = Math.abs((game.P.y + game.P.Hh) - (enemy.y + enemy.Hh));
  const Edis = Math.sqrt((PExdis ** 2) + (PEydis ** 2));

  for (const B of game.beams){
    if (B.Clear) return false;

    const Bdis = B.x + B.W;

    const Brml = angleToKey[B.angle];

    if (
      (Bdis > Edis) &&
      (Erml[0] === Brml[0]) &&
      (Erml[1] === Brml[1]) //&& 
      //(!enemy.DeathCheck)
    ) {
      hit = true;
      B.Clear = Edis;
      B.BeamHitCount += 40;
    }
  }

  return hit;
  
  //console.log("BeamHitCheck()")
}

function hitCheck(enemy) {
  return (
    Math.abs(
      //playerとenemyの距離
      (game.P.x + game.P.Wh) - Math.abs(enemy.x + enemy.Wh)
    ) < (
      //playerの幅半分 + enemyの幅半分
      game.P.Wh + enemy.Wh
    ) &&
    Math.abs(
      //playerとenemyの距離
      (game.P.y + game.P.Hh) - Math.abs(enemy.y + enemy.Hh)
    ) < (
      //playerの幅半分 + enemyの幅半分
      game.P.Hh + enemy.Hh
    )
  );

  //console.log("hitCheck()")
}

const SpSt = {
  top  : {R  : 0,M  : 0,L  : 0},
  mid  : {R  : 0,M  : 0,L  : 0},
  und  : {R  : 0,M  : 0,L  : 0},
}

let SppSt = 0;

function create() {
  //仕分け
  for (const [Y, Xobj] of Object.entries(spawnP)) {
    for (const [X, Cobj] of Object.entries(Xobj)) {

      SpSt[Y][X]++;

      if (SpSt[Y][X] >= (SPPCool * 40) && SppSt >= (SPcooldown * 40)) {
        const SPrandom = Math.floor(Math.random() * (SPprobability * 40));
        if (SPrandom === 0) createEnemy(kind(tmu(Y)), Cobj, X, Y);
      }

    }
  }

  SppSt++

  //console.log("create()")
}

function tmu(Y) {
let tmu = null;

if (Y === "top") {
  tmu = "topSp";
}
if (Y === "mid") {
  tmu = "midSp";
}
if (Y === "und") {
  tmu = "undSp";
}

return tmu;
}

const SPCount = {}

function createEnemy(enemyImg, Cobj, X, Y) {
  const enemy = enemyImg;

  const move = [0, 0];
  const exXY = [0, 0];

  if (X === "R") {
    move[0] = -1;
    exXY[0] = 0;
  } if (X === "M") {
    move[0] = 0;
    exXY[0] = -enemyStatus[enemy].Wh;
  } if (X === "L") {
    move[0] = -1;
    exXY[0] = 0;
  }

  if (Y === "top") {
    move[1] = 1;
    exXY[1] = -enemyStatus[enemy].H;
  } if (Y === "mid") {
    move[1] = 0;
    exXY[1] = -enemyStatus[enemy].Hh;
  } if (Y === "und") {
    move[1] = -1;
    exXY[1] = 0;
  }

  const EXStatus = {
    x : Cobj.x + exXY[0],
    y : Cobj.y + exXY[1],

    moveX : move[0],
    moveY : move[1],

    key  : enemy,

    Xrml  : X,
    Yrml  : Y,
  }

  const push = { ...EXStatus , ...enemyStatus[enemy] };

  game.enemys.push(push);
  push.createAbility();

  if (SPCount[enemy] === undefined) {
    SPCount[enemy] = 0;
  }
  ++SPCount[enemy];

  // console.log(push.key);

  SpSt[Y][X] = 0;
  SppSt = 0;

  //console.log("createEnemy()");
}

function kind(key) {
  let SPkind = 0;

  let rateCount = 0;

  for (const EImgObj of game.image[key]) {
    const ene = Object.keys(EImgObj)[0];
    rateCount += enemyStatus[ene].rate;
  }

  let SPpool = Math.floor(Math.random() * rateCount);

  let rateCount_1 = 0;

  let i = 0

  for (const EImgObj of game.image[key]) {
    const ene = Object.keys(EImgObj)[0];
    rateCount_1 += enemyStatus[ene].rate;
    if (SPpool < rateCount_1) {
      SPkind = i;
      break;
    }
    ++i;
  }

  return (Object.keys(game.image[key][SPkind]))[0];

  //console.log("kind()")
}

let RotateCount = 0;
let AngleCount = 0;

let flip = 1;

function PlayRotate(CCC) {
  const P = game.P;

  if (BadStatus.IceCount <= 0 || CCC !== 0) {
    AngleCount += 45 * CCC;
    RotateCount++;
  }

  AngleCount += 360;
  AngleCount %= 360;

  const absAC = Math.abs(AngleCount);
  if (absAC >= 135 && 225 >= absAC) {
    flip = -1;
  }
  if (absAC >= 315 || 45 >= absAC) {
    flip = 1;
  }

  ctx.translate(C.Wh, C.Hh);
  const PlAngle = AngleCount * rad;
  ctx.rotate(PlAngle);

  ctx.scale(1, flip);

  ctx.drawImage(game.P.Byimg, -P.Wh, -P.Hh);
  ctx.drawImage(game.P.Hdimg, -P.Wh + P.W - 5, -P.Hh + 15);

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (BadStatus.IceCount > 0) Ice();
  if (BadStatus.FireCount > 0) Fire();
  if (BadStatus.PalsyCount > 0) palsy();

  drawEnemy();

  //console.log("PlayRotate()")
}

function Ice() {
  ctx.drawImage(game.StatusImage.Ice,C.Wh - (game.StatusImage.Ice.width / 2),C.Hh - (game.StatusImage.Ice.height / 2));

  //console.log("Ice()")
}

function Fire() {
  ctx.drawImage(game.StatusImage.Fire,C.Wh - (game.StatusImage.Fire.width / 2),C.Hh - (game.StatusImage.Fire.height / 2));

  //console.log("Fire()")
}

function palsy() {
  ctx.drawImage(game.StatusImage.palsy,C.Wh - (game.StatusImage.palsy.width / 2),C.Hh - (game.StatusImage.palsy.height / 2));
}

function Start() {
  game.gameCounter = 0;
  game.enemys = [];
  game.beams = [];
  game.Over = false;
  game.score = 0;
  createPlayer();

  BadStatus.IceCount = 0;
  BadStatus.FireCount = 0;
  BadStatus.PalsyCount = 0;

  game.timer = setInterval(clock, 25);
  game.beam = setInterval(Beam,BeamFrequency * 1000);

  //console.log("Start()")
}

function drawPlayer() {
  PlayRotate(0);

  //console.log("drawPlayer()");
}

function createPlayer() {
  game.P = {
    x : C.Wh - (game.PlImage.Body.width / 2),
    y : C.Hh - (game.PlImage.Body.height / 2),

    W : game.PlImage.Body.width,
    H : game.PlImage.Body.height,
    Wh : game.PlImage.Body.width / 2,
    Hh : game.PlImage.Body.height / 2,

    Hdimg : game.PlImage.Head,
    Byimg : game.PlImage.Body,

    HP : 100,
  }

  drawBG();

  PlayRotate(0);

  //console.log("createPlayer()");
}

function addStatus() {
  enemyStatus = {
    FireBird : {
      W  : game.image.topSp[0].FireBird.width,
      H  : game.image.topSp[0].FireBird.height,
      Wh : game.image.topSp[0].FireBird.width / 2,
      Hh : game.image.topSp[0].FireBird.height / 2,

      image : game.image.topSp[0].FireBird,

      speed : 4.5,

      HP : 1,

      power : 4,

      rate : 8,

      hitAbility : (E) => {
        for (const [Type,Count] of Object.entries(BadStatus)) if (Count > 0 && Type !== "FireCount") BadStatus[Type] = 0;
        BadStatus.FireCount += 110;
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 1,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      deadAbility : (E) => {
        
      },

      clockAbility : (E) => {
        
      },

      SPAbility : (E) => {
        
      },

      createAbility : (E) => {
        
      }
    },
    IceBird : {
      W  : game.image.topSp[1].IceBird.width,
      H  : game.image.topSp[1].IceBird.height,
      Wh : game.image.topSp[1].IceBird.width / 2,
      Hh : game.image.topSp[1].IceBird.height / 2,

      image : game.image.topSp[1].IceBird,

      speed : 4.5,

      HP : 1,

      power : 4,

      rate : 8,

      hitAbility : (E) => {
        for (const [Type,Count] of Object.entries(BadStatus)) if (Count > 0 && Type !== "IceCount") BadStatus[Type] = 0;
        BadStatus.IceCount += 40;
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 1,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      deadAbility : (E) => {
        
      },

      clockAbility : (E) => {
        
      },

      SPAbility : (E) => {
        
      },

      createAbility : (E) => {
        
      }
    },
    FoolBird : {
      W  : game.image.topSp[2].FoolBird.width,
      H  : game.image.topSp[2].FoolBird.height,
      Wh : game.image.topSp[2].FoolBird.width / 2,
      Hh : game.image.topSp[2].FoolBird.height / 2,

      image : game.image.topSp[2].FoolBird,

      speed : 4.5,

      HP : 1,

      power : 4,

      rate : 8,

      hitAbility : (E) => {
        for (let i = 0; i < ((Math.floor(Math.random() * 7)) + 1); i++) PlayRotate(1);
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 1,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      clockAbility : (E) => {
        
      },

      deadAbility : (E) => {
        
      },

      SPAbility : (E) => {
        
      },

      createAbility : (E) => {
        
      }
    },
    letterBird : {
      W  : game.image.topSp[3].letterBird.width,
      H  : game.image.topSp[3].letterBird.height,
      Wh : game.image.topSp[3].letterBird.width / 2,
      Hh : game.image.topSp[3].letterBird.height / 2,

      image : game.image.topSp[3].letterBird,

      speed : 5.5,

      HP : 1,

      power : 2,

      rate : 8,

      hitAbility : (E) => {
        for (let i= 0;i< 2;++i) {
          const s = Math.floor(Math.random() * AbilitySpawn.length);
          const AS = AbilitySpawn[s];
          createEnemy(kind(tmu(AS[0])), spawnP[AS[0]][AS[1]], AS[1], AS[0]);
        }
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 1,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      deadAbility : (E) => {
        
      },

      clockAbility : (E) => {
        
      },

      SPAbility : (E) => {
        
      },

      createAbility : (E) => {
        
      }
    },
    FlyDog : {
      W : game.image.midSp[0].FlyDog.width,
      H : game.image.midSp[0].FlyDog.height,
      Wh : game.image.midSp[0].FlyDog.width / 2,
      Hh : game.image.midSp[0].FlyDog.height / 2,

      image : game.image.midSp[0].FlyDog,

      speed : 3,

      HP : 3,

      power : 8,

      rate : 6,

      hitAbility : (E) => {
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 2,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      deadAbility : (E) => {
        
      },

      clockAbility : (E) => {
        
      },

      SPAbility : (E) => {
        
      },

      createAbility : (E) => {
        
      }
    },
    hippo : {
      W  : game.image.midSp[2].hippo.width,
      H  : game.image.midSp[2].hippo.height,
      Wh : game.image.midSp[2].hippo.width / 2,
      Hh : game.image.midSp[2].hippo.height / 2,

      image : game.image.midSp[2].hippo,

      speed : 1.5,

      HP : 2,

      power : 20,

      rate : 8,

      hitAbility : (E) => {
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 1.2,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      deadAbility : (E) => {
        
      },

      clockAbility : (E) => {
        
      },

      SPAbility : (E) => {
        
      },

      createAbility : (E) => {
        
      }
    },
    deer : {
      W  : game.image.midSp[3].deer.width,
      H  : game.image.midSp[3].deer.height,
      Wh : game.image.midSp[3].deer.width / 2,
      Hh : game.image.midSp[3].deer.height / 2,

      image : game.image.midSp[3].deer,

      speed : 4.5,

      HP : 3,

      power : 12,

      rate : 7,

      hitAbility : (E) => {
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 3,
      shotAbility : (E) => {
        DamageEffect(E);
      },
      
      deadAbility : (E) => {
        for (const enemy of game.enemys) {
          enemy.speed *= (5 / 6);
          enemy.power = Math.floor(enemy.power * (5 / 4));
        }
      },

      clockAbility : (E) => {
        
      },

      SPAbility : (E) => {
        E.speed *= 1.2;
        E.power = Math.floor(E.power * 0.8);
      },

      createAbility : (E) => {
        for (const enemy of game.enemys) {
          enemy.speed *= 1.2;
          enemy.power = Math.floor(enemy.power * 0.8);
        }
      }
    },
    Tsaurus : {
      W  : game.image.midSp[4].Tsaurus.width,
      H  : game.image.midSp[4].Tsaurus.height,
      Wh : game.image.midSp[4].Tsaurus.width / 2,
      Hh : game.image.midSp[4].Tsaurus.height / 2,

      image : game.image.midSp[4].Tsaurus,

      speed : 1.5,

      HP : 10,

      power : 30,

      rate : 1,

      hitAbility : (E) => {
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 1.5,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      deadAbility : (E) => {
        for (const enemy of game.enemys) {
          enemy.speed *= 2;
          enemy.power = Math.floor(enemy.power * (2 / 3));
        }
      },

      clockAbility : (E) => {
        
      },

      SPAbility : (E) => {
        E.speed *= 0.5;
        E.power = Math.floor(E.power * 1.5);
      },

      createAbility : (E) => {
        for (const enemy of game.enemys) {
          enemy.speed *= 0.5;
          enemy.power = Math.floor(enemy.power * 1.5);
        }
      }
    },
    runner : {
      W  : game.image.midSp[1].runner.width,
      H  : game.image.midSp[1].runner.height,
      Wh : game.image.midSp[1].runner.width / 2,
      Hh : game.image.midSp[1].runner.height / 2,

      image : game.image.midSp[1].runner,

      speed : 2,
      accel : 0,

      HP : 1,

      power : 6,

      rate : 3,

      hitAbility : (E) => {
        if (game.P.HP > 0) game.P.HP -= E.power; 
      },

      back : 1,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      deadAbility : (E) => {
        
      },

      clockAbility : (E) => {
        if (E.accel < 0.5) E.speed = 2 + (16 * (E.accel ** 6)) * 8;
        else E.speed = 2 + (1 - ((-2 * E.accel + 2) ** 8) / 2) * 8;
        if (E.accel <= 1) E.accel += 0.01;
      },

      SPAbility : (E) => {
        
      },

      createAbility : (E) => {
        
      }
    },
    pachy : {
      W  : game.image.undSp[1].pachy.width,
      H  : game.image.undSp[1].pachy.height,
      Wh : game.image.undSp[1].pachy.width / 2,
      Hh : game.image.undSp[1].pachy.height / 2,

      image : game.image.undSp[1].pachy,

      speed : 4,

      HP : 2,

      power : 10,

      rate : 8,

      hitAbility : (E) => {
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 0,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      deadAbility : (E) => {
        
      },

      clockAbility : (E) => {
        
      },

      SPAbility : (E) => {
        
      },

      createAbility : (E) => {
        
      }
    },
    turtle : {
      W  : game.image.undSp[2].turtle.width,
      H  : game.image.undSp[2].turtle.height,
      Wh : game.image.undSp[2].turtle.width / 2,
      Hh : game.image.undSp[2].turtle.height / 2,

      image : game.image.undSp[2].turtle,

      speed : 0.8,

      HP : 6,

      power : 0,

      rate : 5,

      hitAbility : (E) => {
        if (game.P.HP > 0) game.P.HP = Math.floor(game.P.HP * 0.6);
      },

      back : 0.8,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      clockAbility : (E) => {

      },

      deadAbility : (E) => {
        
      },

      SPAbility : (E) => {
        
      },

      createAbility : (E) => {
        
      }
    },
    togari : {
      W  : game.image.undSp[3].togari.width,
      H  : game.image.undSp[3].togari.height,
      Wh : game.image.undSp[3].togari.width / 2,
      Hh : game.image.undSp[3].togari.height / 2,

      image : game.image.undSp[3].togari,

      speed : 4.5,

      HP : 1,

      power : 4,

      rate : 8,

      hitAbility : (E) => {
        for (const [Type,Count] of Object.entries(BadStatus)) if (Count > 0 && Type !== "PalsyCount") BadStatus[Type] = 0;
        BadStatus.PalsyCount += 130;
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 1,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      clockAbility : (E) => {

      },

      deadAbility : (E) => {
        
      },

      SPAbility : (E) => {

      },

      createAbility : (E) => {
        
      }
    },
    capy : {
      W  : game.image.undSp[4].capy.width,
      H  : game.image.undSp[4].capy.height,
      Wh : game.image.undSp[4].capy.width / 2,
      Hh : game.image.undSp[4].capy.height / 2,

      image : game.image.undSp[4].capy,

      speed : 4,

      HP : 2,

      power : 8,

      rate : 8,

      hitAbility : (E) => {
        if (game.P.HP > 0) game.P.HP -= E.power;
      },

      back : 0.8,
      shotAbility : (E) => {
        DamageEffect(E);
      },

      deadAbility : (E) => {
        
      },

      clockAbility : (E) => {
        
      },

      SPAbility : (E) => {
        
      },

      createAbility : (E) => {
        for (const enemy of game.enemys) enemy.SPAbility(E);
      }
    },
  }

  //console.log("addStatus()");
}

function DamageEffect(E) {
  let Back = E.back;
  if (E.Xrml === "M" || E.Yrml === "mid") Back *= 1.41;

  E.x -= E.moveX * 7 * Back;
  E.y -= E.moveY * 7 * Back;

  setTimeout(DamageRecoil,200,E,Back);
}

function DamageRecoil(E,Back) {
  if (Back === 0) Back = 1;

  E.x += E.moveX * 4 * Back;
  E.y += E.moveY * 4 * Back;
}