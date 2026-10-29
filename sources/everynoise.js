// Genre data derived from Every Noise at Once (https://everynoise.com, by Glenn McDonald):
// ~6,300 genre names plus each genre's "sounds similar" list for the genres the prompt parser knows.
// Artist lists per genre are read live from everynoise.com.
const EN = `pop
rap
rock
urbano latino
hip hop
trap latino
reggaeton
dance pop
pop rap
modern rock
pov: indie
musica mexicana
latin pop
classic rock
filmi
permanent wave
trap
alternative metal
k-pop
r&b
corrido
canadian pop
norteno
sierreno
album rock
soft rock
pop dance
sad sierreno
edm
hard rock
contemporary country
mellow gold
uk pop
melodic rap
modern bollywood
alternative rock
banda
post-grunge
corridos tumbados
sertanejo universitario
nu metal
country
art pop
atl hip hop
urban contemporary
sertanejo
southern hip hop
singer-songwriter
reggaeton colombiano
arrocha
french hip hop
colombian pop
alt z
country road
mexican pop
canadian hip hop
j-pop
indonesian pop
singer-songwriter pop
ranchera
new wave pop
indietronica
german hip hop
pop urbaine
rock en espanol
latin alternative
gangster rap
soul
k-pop boy group
latin arena pop
chicago rap
italian pop
heartland rock
k-pop girl group
agronejo
modern country pop
electro house
latin hip hop
canadian contemporary r&b
pop punk
neo mellow
pop rock
latin rock
punjabi pop
rap metal
trap argentino
new romantic
new wave
uk dance
slap house
modern alternative rock
indie pop
indie rock
house
conscious hip hop
modern country rock
east coast hip hop
folk rock
metal
turkish pop
bedroom pop
desi pop
italian hip hop
hoerspiel
afrobeats
adult standards
post-teen pop
neo soul
sped up
cloud rap
viral pop
talent show
spanish pop
punk
alternative r&b
grupera
west coast rap
opm
boy band
psychedelic rock
glam metal
stomp and holler
desi hip hop
ccm
rage rap
hip pop
puerto rican pop
german pop
miami hip hop
argentine rock
sertanejo pop
tropical
glam rock
funk carioca
nigerian pop
argentine hip hop
dark trap
latin viral pop
piano rock
detroit hip hop
italian adult pop
country rock
underground hip hop
mexican hip hop
progressive electro house
synthpop
metropopolis
garage rock
indie folk
vocal jazz
classical
europop
progressive house
art rock
yacht rock
mpb
pagode
tropical house
urbano espanol
chamber pop
rap francais
dance rock
j-rock
polish hip hop
sleep
folk
anime
trap brasileiro
disco
pluggnb
british soul
metalcore
australian pop
uk hip hop
christian music
gen z singer-songwriter
electropop
big room
forro
swedish pop
classic oklahoma country
reggaeton flow
pop nacional
british invasion
mexican rock
indie soul
contemporary r&b
folk-pop
white noise
pagode novo
soundtrack
funk metal
grunge
french pop
emo rap
salsa
rain
r&b francais
lgbtq+ hip hop
turkish rock
memphis hip hop
mariachi
brostep
classic soul
funk mtg
trap triste
dirty south rap
melodic metalcore
blues rock
alternative hip hop
melancholia
pop soul
brazilian gospel
outlaw country
orchestral soundtrack
dutch house
turkish hip hop
queens hip hop
christian alternative rock
mandopop
lounge
worship
dfw rap
electronica
pixel
trap italiana
pop reggaeton
new orleans rap
otacore
rock-and-roll
funk
quiet storm
motown
japanese teen pop
brazilian hip hop
gruperas inmortales
kleine hoerspiel
indie poptimism
dream pop
rap conscient
neo-synthpop
funk rock
easy listening
bolero
g funk
barbadian pop
progressive rock
eurodance
hardcore hip hop
bachata
australian dance
neon pop punk
emo
trap boricua
brazilian rock
funk paulista
pop venezolano
cantautor
chanson
drift phonk
florida rap
bedroom r&b
latin christian
movie tunes
indonesian pop rock
russian hip hop
spanish hip hop
cali rap
dancehall
brooklyn drill
trap queen
urbano chileno
color noise
children's music
world worship
urbano mexicano
sheffield indie
classic texas country
escape room
modern indie pop
funk rj
plugg
anime rock
merseybeat
reggae fusion
shoegaze
tamil hip hop
britpop
australian rock
industrial metal
baroque pop
brooklyn indie
pop argentino
r&b en espanol
trance
turkish trap
thai pop
lilith
indian instrumental
downtempo
southern rock
sophisti-pop
punjabi hip hop
polish trap
socal pop punk
candy pop
tamil pop
rockabilly
girl group
uk contemporary r&b
atl trap
old school thrash
classic bollywood
compositional ambient
gym phonk
north carolina hip hop
dark r&b
country dawn
symphonic rock
tennessee hip hop
instrumental lullaby
pittsburgh rap
thrash metal
afropop
screamo
canadian rock
kindermusik
melodic drill
nyc rap
modern blues rock
rock nacional brasileiro
philly rap
afrofuturism
healing hz
cumbia pop
rap latina
reggae
madchester
spanish pop rock
k-rap
dutch hip hop
trip hop
la indie
alternative dance
v-pop
rap rock
funk consciente
indie anthem-folk
musica chihuahuense
chill house
australian hip hop
azontobeats
new americana
tejano
korean ost
nova mpb
dutch edm
j-division
sertanejo tradicional
acoustic pop
aesthetic rap
pop flamenco
cancion melodica
sigilkore
rap conciencia
neo-psychedelic
dutch pop
adoracao
ska argentino
irish rock
classic italian pop
indie pop rap
pop r&b
groove metal
power metal
lo-fi study
classic country pop
danish pop
jazz
industrial rock
hyperpop
axe
phonk brasileiro
pixie
bossa nova
uk post-punk
lo-fi indie
cumbia sonidera
southern soul
roots reggae
sad rap
german techno
lo-fi beats
sad lo-fi
pop emo
binaural
german metal
cumbia villera
latin worship
german dance
drill
pop edm
arab pop
brazilian reggae
broadway
roots rock
samba
tech house
filter house
video game music
neo-classical
jazz pop
show tunes
rap canario
mollywood
sufi
swedish hip hop
turkish alt pop
hollywood
spanish rock
nursery
irish singer-songwriter
electro latino
shimmer pop
lullaby
korean r&b
baton rouge rap
skate punk
grime
country pop
german rock
nigerian hip hop
russian pop
noise pop
speed metal
canadian trap
indonesian indie
rap marseille
vallenato
kentucky hip hop
ohio hip hop
la pop
swedish trap pop
salsa puertorriquena
environmental
musica para ninos
french indie pop
hindi hip hop
tollywood
ambient pop
stutter house
cloud rap francais
jazz blues
background piano
lagu jawa
florida drill
cuarteto
dreamo
turbo folk
pinoy hip hop
czsk hip hop
rap napoletano
chicago drill
japanese singer-songwriter
oxford indie
new rave
french rock
swedish electropop
classic j-pop
polish pop
drill francais
new jack swing
canadian singer-songwriter
drill espanol
gym hardstyle
indonesian singer-songwriter
dangdut
swing
deep house
new french touch
industrial
uk alternative pop
coverchill
hare krishna
complextro
kollywood
uk metalcore
baroque
el paso indie
flamenco urbano
modern indie folk
country rap
early music
glitchcore
cantopop
bachata dominicana
modern folk rock
egyptian pop
mexican indie
bubblegrunge
beatlesque
norwegian pop
meditation
symphonic metal
arabesk
german drill
deep underground hip hop
electronic trap
classic pakistani pop
electric blues
weirdcore
late romantic era
chill r&b
meme rap
viral rap
japanese vgm
funk ostentacao
trap funk
arrochadeira
indie r&b
pop rock brasileiro
previa
blues
covertronica
pagode baiano
indie rock italiano
bhojpuri pop
neue deutsche harte
scandipop
classic canadian rock
meme
belgian edm
indonesian jazz
contemporary vocal jazz
nu-cumbia
rap dominicano
anime score
classic swedish pop
ambient lo-fi
swamp rock
vocaloid
classical era
pakistani hip hop
australian psych
australian indie
instrumental hip hop
c-pop
old school atlanta hip hop
indonesian rock
punk blues
taiwan pop
power pop
schlager
chillhop
russian trap
nz pop
gujarati pop
memphis soul
musica popular colombiana
mambo chileno
christian rock
classic indonesian rock
early romantic era
edmonton indie
sacramento indie
jam band
drum and bass
melbourne bounce international
dutch rap pop
dangdut koplo
turkish folk
golden age hip hop
javanese dangdut
post-punk argentina
alternative emo
greek trap
post-punk
hamburg hip hop
soul blues
pop rap brasileiro
venezuelan hip hop
j-pixie
cantautora mexicana
deep euro house
pop lgbtq+ brasileira
bass house
nouvelle chanson francaise
crunk
electro
operatic pop
spanish indie pop
celtic rock
vietnamese hip hop
p-pop
indie hip hop
stoner rock
pop house
bubblegum pop
argentine indie
modern bhajan
new york drill
red dirt
irish pop
danish hip hop
progressive metal
canadian metal
malaysian pop
countrygaze
indie garage rock
etherpop
ska
bebop
funk pop
chilean rock
chinese viral pop
turkce drill
australian electropop
musica de fondo
philly indie
hip house
post-romantic era
swedish gangsta rap
dancefloor dnb
comic
scenecore
piano cover
rumba
electra
korean pop
reggae rock
dance-punk
chill pop
german alternative rap
canadian indie
preschool children's music
moombahton
tagalog rap
background music
funk bh
torch song
indie surf
italian underground hip hop
pop romantico
dutch rock
rome indie
uk drill
protopunk
shush
smooth jazz
j-poprock
old school hip hop
ectofolk
small room
turkish singer-songwriter
indonesian r&b
kentucky roots
turkish alternative rock
bedroom soul
cartoon
modern salsa
writing
background jazz
lo-fi jazzhop
musica infantil
romanian pop
gauze pop
chillwave
deep ccm
norteno-sax
alternative pop rock
finnish pop
trova
desi trap
dembow
cumbia
speedrun
world
norwegian indie
perreo
reggaeton chileno
aussietronica
classic schlager
melbourne bounce
rock cristiano
finnish hip hop
french indietronica
experimental pop
belgian hip hop
classic opm
jazz funk
tecnobanda
japanese soundtrack
modern dream pop
pinoy r&b
czech hip hop
indie triste
south carolina hip hop
trap mexicano
albanian hip hop
boom bap espanol
chutney
laiko
sunshine pop
birmingham metal
german soundtrack
disco house
fvnky rimex
acid rock
instrumental worship
japanese alternative rock
scottish rock
corridos alternativos
nashville sound
modern alternative pop
rap df
velha guarda
rap politico
post-hardcore
cumbia 420
british singer-songwriter
bossa nova cover
social media pop
brazilian edm
scorecore
redneck
german baroque
detroit trap
texas country
greek pop
british soundtrack
swedish metal
israeli pop
slowcore
gaming edm
houston rap
german romanticism
nu jazz
panamanian pop
new jersey rap
epicore
r&b brasileiro
slowed and reverb
czech pop
death metal
arkansas country
chicano rap
high vibe
swedish trap
political hip hop
j-rap
uk funky
albanian pop
mexican rock-and-roll
black americana
ghazal
modern southern rock
indian singer-songwriter
japanese emo
indian indie
indonesian folk
deboxe
french synthpop
russian dance
gothic metal
lo-fi cover
post-disco
greek hip hop
rap genovese
trap chileno
reggaeton mexicano
cumbia chilena
italian indie pop
kentucky indie
nyc pop
uk alternative hip hop
bronx drill
italo dance
salsa colombiana
euphoric hardstyle
christian indie
canadian punk
polish viral pop
musica sonorense
brill building pop
modern blues
rawstyle
afroswing
oakland hip hop
hard rock brasileiro
grupero romantico
phonk
modern power pop
rap calme
rock urbano mexicano
british blues
hardcore punk
anime lo-fi
hungarian pop
russian alt pop
rap belge
chicago indie
lo-fi sleep
german cloud rap
cumbia peruana
indie game soundtrack
spanish new wave
stomp and flutter
bossbeat
minimal techno
alternative country
gothic symphonic metal
banda jalisciense
minnesota hip hop
latin talent show
frauenrap
early modern classical
asmr
acoustic cover
afrofuturismo brasileiro
zolo
nu disco
indonesian pop punk
afro r&b
hi-nrg
lo-fi chill
anadolu rock
duranguense
dubstep
trancecore
dutch trance
christian hip hop
jazz rap
persian pop
rock gospel brasileiro
pop electronico
finnish dance pop
supergroup
deep groove house
classic hardstyle
modern hard rock
ocean
haryanvi pop
belgian pop
contemporary post-bop
vietnamese melodic rap
hip hop tuga
gospel
shiver pop
jazz trumpet
american metalcore
canadian electronic
water
barnmusik
northern soul
argentine telepop
deathcore
pakistani pop
visual kei
stoner metal
ukrainian pop
doo-wop
colombian hip hop
traprun
melodic dubstep
seattle hip hop
detroit rock
hindi indie
ambient worship
piseiro
ska mexicano
big beat
canadian country
pinoy trap
vapor soul
haryanvi hip hop
taiwan singer-songwriter
hardwave
australian indie folk
folklore argentino
partyschlager
rock alternativo brasileiro
diva house
london rap
argentine reggae
future garage
milan indie
intelligent dance music
drumless hip hop
nwobhm
charva
cool jazz
canadian pop punk
indonesian alternative rock
indonesian folk pop
melodic death metal
j-pop boy group
japanese electropop
australian surf rock
j-acoustic
progressive bluegrass
corridos clasicos
rif
turkce slow sarkilar
canadian contemporary country
chicago bop
middle earth
swedish synthpop
hawaiian hip hop
neoperreo
boston rock
classic mandopop
soul jazz
rave funk
seattle indie
vocal house
russelater
cubaton
vapor twitch
mainland chinese pop
trap soul
electronica argentina
tropicalia
manguebeat
rock uruguayo
rap espanol
korean city pop
jazz saxophone
moroccan pop
impressionism
nu gaze
chill drill
urdu hip hop
traditional blues
dinner jazz
funk 150 bpm
jamaican dancehall
brighton indie
spacegrunge
musica bajacaliforniana
suomi rock
comic metal
swedish idol pop
alte
japanese r&b
swedish alternative rock
psychedelic hip hop
japanese chillhop
roots worship
experimental r&b
uplifting trance
new age
p funk
scam rap
vallenato moderno
german indie
new age piano
float house
sky room
swedish indie pop
rock drums
sound
levenslied
nueva cancion
russian rock
bhajan
experimental hip hop
bolero mexicano
vancouver indie
arabic hip hop
new jersey indie
nashville hip hop
ska punk
rap cristiano
english indie rock
naija worship
uk americana
neo-singer-songwriter
modern j-rock
south african pop
lo-fi product
rap maroc
ambient folk
bass trap
classic kollywood
jazz piano
rebel blues
toronto indie
progressive trance
tierra caliente
muziek voor kinderen
dark pop
odia pop
trap colombiano
indie quebecois
ambient
funk viral
medieval rock
teen pop
folk brasileiro
lo-fi
manele
instrumental rock
trap baiano
british folk
rap baiano
amapiano
funk mandelao
celtic
tekk
turkish alternative
german hard rock
canadian latin
bases de freestyle
minneapolis sound
bubblegum dance
funk das antigas
jazz cover
british indie rock
alabama rap
baltimore indie
women's music
old school rap francais
antiviral pop
shamanic
basshall
czech rock
a cappella
deep tropical house
nasheed
japanese soul
german trap
rkt
brazilian ccm
zhongguo feng
crank wave
st louis rap
canzone d'autore
trap catala
athens indie
australian house
australian reggae fusion
philly soul
classic girl group
boom bap
r&b argentino
bow pop
texas latin rap
synthwave
chill phonk
rap catala
pinoy rock
thai indie pop
austropop
azonto
karadeniz turkuleri
russian drain
indie viet
nu-metalcore
swedish singer-songwriter
hopebeat
gymcore
focus
wonky
swedish eurodance
russian gangster rap
taiwan indie
synth funk
rap mineiro
rap algerien
ye ye
singaporean pop
pinoy reggae
art punk
batidao romantico
indiecoustica
hypnagogic pop
djent
variete francaise
classify
indonesian worship
greek drill
g-house
turkish trap pop
lebanese pop
tamaulipas rap
polish alternative
swedish drill
harlem renaissance
uk doom metal
hard bop
jazztronica
portuguese pop
classic soundtrack
italian baroque
westcoast flow
rap chileno
rap geek
russian romanticism
j-pop girl group
new school turkce rap
sleaze rock
brazilian jazz
electronic rock
chill abstract hip hop
jazz guitar
rhythm game
proto-metal
prog metal
bassline
retro soul
jazz fusion
latin afrobeat
classic colombian pop
iskelma
proto-hyperpop
japanese classical
electro swing
rock nacional
rap cearense
rock gaucho
pop folk
spanish punk
australian children's music
rock kapak
cyberpunk
eau claire indie
scottish singer-songwriter
lo-fi vgm
chicha
french soundtrack
deep german hip hop
classic city pop
salsa venezolana
hardcore techno
classic russian pop
ottawa rap
turkish deep house
stomp pop
nintendocore
boom bap brasileiro
italo disco
ghanaian pop
rap sardegna
lata
latin jazz
swedish power metal
anime rap
hk-pop
classic arab pop
rap underground espanol
italian alternative
glitch hop
forro de favela
black metal
filthstep
spanish metal
boston hip hop
romanian trap
cumbia santafesina
german r&b
thai rock
anthem emo
merengue
rock brasiliense
banda sinaloense
french reggae
trap carioca
hands up
german underground rap
atlanta indie
bitpop
newcastle nsw indie
christian pop
bandung indie
chill breakcore
classic uk pop
flamenco
musica tlaxcalteca
indie electropop
deep disco house
livetronica
chicago punk
aussie drill
mahraganat
pet calming
classic russian rock
pop violin
nederpop
indie punk
reggaeton cristiano
breakbeat
lo-fi rap
palm desert scene
german punk
afghan pop
folk punk
argentine alternative rock
finnish metal
boston folk
nordic soundtrack
cumbia del sureste
australian alternative rock
desi emo rap
violao
grave wave
abstract hip hop
israeli mediterranean
german pop rock
lovers rock
barnsagor
fantasy metal
melodic thrash
mississippi hip hop
german singer-songwriter
lo-fi emo
cumbia ranchera
future house
anthem worship
australian metalcore
thai indie rock
dembow dominicano
icelandic indie
dark synthpop
upstate ny rap
acoustic opm
australian country
venezuelan rock
scream rap
morelos indie
bboy
noise rock
narco rap
sholawat
manchester hip hop
future bass
organic electronic
pop nacional antigas
instrumental funk
k-indie
cumbia sonorense
carnaval
digital hardcore
dutch indie
garage rock revival
indie liguria
ghanaian hip hop
trap venezolano
traphall
belgian dance
swedish melodeath
kirtan
qawwali
cancion infantil latinoamericana
polish classical
reggae en espanol
detroit trap brasileiro
psychedelic soul
kizomba
nerdcore brasileiro
canzone napoletana
neue neue deutsche welle
chinese r&b
thai hip hop
uptempo hardcore
indian folk
modern reggae
happy hardcore
musica tradicional cubana
solo wave
canadian soundtrack
classic sierreno
egyptian trap
classic praise
asian american hip hop
swedish pop rap
turkish psych
veracruz indie
icelandic rock
finnish power metal
indonesian reggae
bubble trance
acoustic guitar cover
pop virale italiano
rai
danish rock
liquid funk
turkish jazz
tontipop
dansband
pianissimo
kayokyoku
singaporean mandopop
bronx hip hop
jazz trio
japanese punk rock
dark clubbing
electro-pop francais
egyptian hip hop
french shoegaze
drill italiana
aggressive phonk
uk dnb
progressive metalcore
french romanticism
neo r&b
german house
electropowerpop
japanese alternative pop
vegas indie
austindie
uk reggae
healing
musica triste brasileira
samba-enredo
afro soul
jovem guarda
gujarati garba
nightcore
saskatchewan indie
swedish death metal
hamburg electronic
canadian americana
umbanda
souldies
anti-folk
riot grrrl
monterrey indie
mexican classic rock
new orleans jazz
organic house
dixieland
cosmic american
rap feminino nacional
british alternative rock
indonesian idol pop
jawaiian
mariachi cristiano
classic cantopop
romantico
german power metal
classic disco polo
musique pour enfants
swedish tropical house
discofox
chilena
j-metal
welsh rock
bulgarian pop
virginia hip hop
brega paraense
thai trap
grungegaze
chicago hardcore
sludge metal
pacific islands pop
south african rock
swedish indie rock
russian post-punk
smooth saxophone
ukrainian rock
chicago soul
samba moderno
freestyle
american shoegaze
latin metal
german reggae
danish metal
rock mineiro
sound team
canadian electropop
drone
regional mexicano femenil
indian edm
j-idol
okinawan pop
sandalwood
scottish new wave
indie jazz
afrikaans
nz reggae
israeli rock
oklahoma country
viking metal
christian trap
brega
buffalo hip hop
kazakh pop
chill lounge
belly dance
minimal tech house
icelandic pop
classic indo pop
oakland indie
surf punk
australian trap
brutal death metal
christian metal
japanese vtuber
south african hip hop
rhode island rap
austrian pop
shaabi
celtic metal
salsa peruana
tecnobrega
indian lo-fi
transpop
chillstep
japanese trap
egyptian alternative
jersey club
experimental
channel pop
czech drill
texas metal
polish rock
norwegian pop rap
indonesian lo-fi pop
samba de roda
sda a cappella
harlem hip hop
danish pop rock
canadian ccm
russian emo rap
pinoy city pop
slayer
memphis phonk
danspunk
polish alternative rap
uk pop punk
indie rock mexicano
bhangra
russian punk
chill dream pop
quran
classic turkish pop
dark techno
gothenburg indie
musica gaucha tradicionalista
boston indie
quebec indie
uk house
psychedelic trance
neoclassical darkwave
oc rap
rave
vapor pop
cdo indie
classic venezuelan pop
kazakh hip hop
guadalajara indie
german alternative rock
karadeniz pop
post-rock
children's folk
polish drill
vaporwave
hungarian hip hop
alternative americana
hyphy
easycore
new beat
indonesian hip hop
instrumental grime
punk urbano
reggae uruguayo
khaliji
opera metal
scottish indie
ann arbor indie
study beats
vintage italian soundtrack
folk rock italiano
mexican pop punk
midwest emo
cumbia paraguaya
italian romanticism
russian drill
swedish hard rock
romanian house
viral trap
liverpool indie
pinoy drill
bandinhas
experimental rock
northern irish indie
bluegrass
jazz boom bap
early us punk
dub
spectra
nashville singer-songwriter
drill chileno
classic danish pop
ambient guitar
piano blues
indian classical
horror punk
pinoy alternative rap
yugoslav rock
turkish instrumental
folk metal
melodic metal
classic french pop
russian electronic
new jersey hardcore
rune folk
french techno
technical death metal
magyar trap
indonesian viral pop
rap underground argentino
norwegian hip hop
dancehall queen
gospel r&b
polish viral rap
south african house
icelandic classical
viral afropop
wave
german metalcore
pop minang
progressive groove metal
deep turkish pop
pink noise
contemporary jazz
classic house
rhythm and blues
classic israeli pop
glee club
american folk revival
kosovan pop
rva drill
atmosphere
peruvian rock
zhenskiy rep
bc underground hip hop
pinoy indie
uk dancehall
kurdish pop
gaming dubstep
danish electronic
spanish folk metal
pinoy singer-songwriter
deep latin christian
north carolina roots
chill guitar
folktronica
croatian pop
swedish soul
bergamo indie
lo-fi house
puerto rican rock
idol rock
idol
kolsche karneval
rocksteady
acoustic blues
latinx alternative
frenchcore
washington indie
soca
auckland indie
oyun havasi
central asian hip hop
antideutsche
christian metalcore
chiptune
spanish modern rock
post-minimalism
rap uliczny
nederlandse hardstyle
gothenburg metal
icelandic experimental
kabarett
latin classical
ghanaian alternative
deep pop edm
jangle pop
calming instrumental
ethereal wave
emo rap italiano
polish underground rap
musica aragonesa
turkish edm
balkan trap
gothic rock
classic peruvian pop
italian opera
gospel antigas
celtic punk
irish folk
dream plugg
classical drill
rock andaluz
focus beats
j-indie
rap boricua
indonesian city pop
afrobeat
rap uruguayo
pop teen brasileiro
dark plugg
idol kayo
kiwi rock
maga rap
pop chileno
chinese indie
brain waves
argentine heavy metal
chinese singer-songwriter
arab electronic
chihuahua indie
progressive post-hardcore
microhouse
portland indie
comedy rap
samba-jazz
classic garage rock
game mood
portland hip hop
ukrainian viral pop
belgian rock
russian grime
chilean indie
french opera
anime phonk
glitchbreak
west bengali pop
rock catala
neue deutsche welle
fourth world
native american traditional
music box
bgm
samba paulista
viking folk
neomelodici
comedy
chicago house
tropical alternativo
vietnamese trap
musica angolana
samba-rock
brega romantico
korean instrumental
halloween
trap pesado
theme
persian hip hop
rap underground mexicano
narodna muzika
swedish indie folk
trap dominicano
contemporary classical
southern americana
fotbollslatar
texas blues
huzunlu sarkilar
malayalam pop
electrofox
partido alto
rap nacional antigo
italian pop rock
murcia indie
german trance
reggae tuga
concepcion indie
canadian folk
pop quebecois
uk melodic rap
piano worship
new jersey punk
instrumental post-rock
nordic house
australian alternative pop
dutch metal
volkspop
kavkaz
polish indie
no beat
japanese new wave
cologne indie
new jersey underground rap
reggae do maranhao
french tech house
minimal melodic techno
japanese pop punk
lagu timur
slc indie
mizrahi
musica costena
entehno
lustrum
balkan hip hop
hip hop quebecois
cowboy western
uk experimental electronic
malaysian mandopop
welsh metal
reggae cristao
indonesian emo
metallic hardcore
belgian indie
rochester mn indie
liedermacher
victoria bc indie
japanese viral pop
bay area indie
trap peruano
ska chileno
marathi pop
trap antillais
laboratorio
chillsynth
minimalism
chalga
dutch cabaret
brega funk
chicago blues
hungarian rock
trap tuga
barnemusikk
birmingham grime
parody
nuevo folklore mexicano
rap tunisien
future rock
jamaican hip hop
mantra
classic iskelma
new weird america
colombian rock
brazilian punk
big band
japanese old school hip hop
kermis
dong-yo
diy emo
plug brasileiro
uk garage
italian soundtrack
australian indigenous music
deathgrind
neo classical metal
taiwan hip hop
neoclassicism
ambeat
peruvian hip hop
south african gospel
swedish country
symphonic deathcore
lagu melayu
thai folk rock
shanty
scandinavian r&b
kwaito
australian indie rock
east coast reggae
emoplugg
finnish trap
indonesian punk
rock baiano
brisbane indie
greek underground rap
musica tamaulipeca
british children's music
progressive deathcore
arab alternative
melodic techno
pinoy pop punk
swancore
gregorian dance
assamese pop
future funk
electro jazz
grime brasileiro
guaracha
romanian rap
czsk emo rap
wrestling
deep comedy
uk contemporary jazz
latin viral rap
strut
bergen indie
tagalog worship
country gospel
dark cabaret
folclore salteno
progressive psytrance
dark wave
ska revival
corridos belicos
new comedy
russian edm
ecuadorian pop
roda de samba
fado
post-screamo
vintage french electronic
carnaval cadiz
pastoral
acoustic rock
rock independant francais
texas pop punk
alternative roots rock
japanese post-hardcore
nova musica pernambucana
slovak hip hop
musica sinaloense
comedy rock
colombian indie
volksmusik
belo horizonte indie
ostrock
israeli hip hop
vbs
xtra raw
musica per bambini
louvor
french jazz
hard bass
world devotional
industrial hip hop
russian hyperpop
japanese metalcore
german oi
nepali pop
sinhala pop
darksynth
korean indie rock
gregorian chant
mambo
deep talent show
miami bass
vietnamese singer-songwriter
classic thai pop
argentine punk
samba reggae
turkish soundtrack
musica andina
chinese idol pop
kansas city hip hop
steampunk
experimental ambient
deathgrass
drain
russian viral rap
j-ambient
banjo
cancion infantil mexicana
solfeggio product
slamming deathcore
classic polish pop
turkce kadin rap
norwegian rock
jungle
ecm-style jazz
abstract beats
cello
ukrainian phonk
saxophone house
south african trap
nottingham hip hop
reggae cover
old school bassline
polish alternative rock
rock quebecois
indonesian ska
australian r&b
emo mexicano
islamic recitation
english baroque
uk tech house
australian post-hardcore
synthesizer
deep new americana
russian underground rap
dark rock
dark post-punk
old school dancehall
doom metal
musica poblana
italian tenor
canadian classical
classical tenor
swedish americana
swedish melodic rock
dangdut remix
crossover thrash
russian rave
musica potosina
sacramento hip hop
german indie folk
north east england indie
punk rock mexicano
psicodelia brasileira
josei rap
japanese instrumental
bakersfield sound
korean old school hip hop
korean talent show
chinese hip hop
tex-mex
anime cv
city pop
deutschrock
drill brasileiro
kawaii metal
canadian metalcore
groove gospel
jewish pop
orgcore
classic belgian pop
brazilian metal
ballet class
musica catalana
kindie rock
musica neoleonesa
indian fusion
carnatic
popwave
nottingham indie
psychedelic pop
battle rap
classic j-rock
indonesian post-hardcore
nightrun
albuquerque indie
irish country
portuguese rock
roots americana
brazilian indie
glam punk
brazilian emo
brit funk
alabama indie
western swing
cumbia lagunera
malaysian indie
post-metal
french metal
classic norwegian pop
australian singer-songwriter
8d
blackened deathcore
tololoche
classic persian pop
flamenco fusion
double drumming
brazilian soul
west coast reggae
k-pop ballad
manila sound
canadian children's music
jazz quartet
afro house
singaporean singer-songwriter
sertanejo gospel
traditional country
dabke
lithuanian pop
christian uplift
trop rock
flint hip hop
trot
rock alternativo espanol
virginia metal
lds youth
chinese bgm
german viral rap
early avant garde
swedish jazz
cumbia andina mexicana
super eurobeat
novelty
russian metal
witch house
acoustic chill
african rock
tribal house
space age pop
uzbek pop
finnish heavy metal
popping
glitch
zouk
kawaii future bass
musica alagoana
louisiana blues
rap cristao
hip-hop experimental
norwegian metal
klubowe
progressive jazz fusion
5th wave emo
dansktop
swiss pop
himachali pop
bongo flava
deep chill
musica coahuilense
eurobeat
braindance
melodic hardcore
latin funk
modern jazz piano
asbury park indie
speed up brasileiro
rap anime
czech folk
trance brasileiro
pub rock
czech pop rock
australian underground hip hop
slovak pop
lds
modern melodic hardcore
salsa choke
relaxative
south african pop dance
birmingham hip hop
ukrainian indie
australian americana
emo trap en espanol
shabad
organic ambient
thai folk pop
gabber
bruneian pop
acoustic punk
hardcore
j-reggae
flute rock
dreampunk
magyar alternative
norwegian country
maskandi
banda carnavalera
afro drill
mathcore
zouk riddim
groove room
israeli singer-songwriter
nu gabber
australian garage punk
latin soundtrack
cologne hip hop
cante flamenco
bouncy house
brazilian bass
san marcos tx indie
dominican pop
deconstructed club
japanese shoegaze
azeri rap
tolkien metal
shred
icelandic singer-songwriter
talentschau
rap lyonnais
classic czech pop
psychobilly
indian rock
country blues
tango
hurdy-gurdy
tone
deep rai
math rock
viet chill rap
yodeling
malang indie
reggae gaucho
chilean hardcore
swedish garage rock
hyperpop francais
ukg revival
symphonic black metal
classic greek pop
finnish melodeath
techno kayo
rap baixada fluminense
shonen
electroclash
karneval
nashville indie
zxc
mande pop
finnish alternative rock
ukrainian hip hop
latintronica
german hyperpop
r&b italiano
italian techno
bosnian pop
lithuanian edm
belarusian indie
lambadao
praise
papuri
ebm
brazilian boogie
dutch tech house
circuit
punjabi lo-fi
christian lo-fi
ukrainian classical
chamber psych
vocal harmony group
pakistani indie
experimental classical
cumbia colombiana regia
polish reggae
german worship
puirt-a-beul
fantasy
reading indie
russian indie
electro bailando
disco polo
seiyu
messianic praise
batak
indie catala
dutch r&b
turk sanat muzigi
perth indie
chinese melodic rap
oktoberfest
belarusian hip hop
fogo pentecostal
ethnotronica
polish punk
microtonal
cumbia ecuatoriana
anime piano
russian modern classical
japanese piano
swedish dancehall
swedish reggae
austin americana
indie rockism
euskal rock
rap antillais
italian reggae
high-tech minimal
ambient house
world fusion
deep tech house
rap siciliano
pop worship
moldovan pop
new italo disco
chill beats
west end
melodic deathcore
south african alternative
syrian pop
turkish modern jazz
uk post-punk revival
instrumental soul
classic finnish pop
furry
shatta
musica gaucha
christian afrobeat
workout product
indie extremena
slovak rock
british jazz
russian punk rock
ragga jungle
oldschool deutschrap
no wave
orchestra
california hardcore
concurso de talentos argentino
swiss indie
british power metal
tanzanian pop
christelijk
surf music
lithuanian electronic
honky tonk
jump up
rap romantico
funktronica
thai indie
san diego rap
j-punk
smutny rap
atlanta metal
mundart
metal cover
finnish death metal
leicester indie
apostolic worship
montreal indie
chanson paillarde
sevdah
gypsy jazz
hardvapour
boston metal
brega saudade
timba
delta blues
speed up turkce
pinoy idol pop
musica cristiana guatemalteca
pirate
funky house
scottish indie rock
techno
southern gospel
dariacore
russian witch house
baglama
classic bhangra
britpop revival
pinoy indie rock
khaleeji iraqi
hawaiian
czech classical
free jazz
acid house
neo-traditional bluegrass
trap beats
huayno
shibuya-kei
denpa-kei
atlanta bass
french death metal
norwegian black metal
comedie musicale
deathstep
nz hip hop
adventista
japanese drill
finnish edm
barcadi
cocuk sarkilari
underground power pop
indonesian indie rock
funk melody
deep minimal techno
atmospheric black metal
musica llanera
nasyid
polish old school hip hop
southern metal
lesen
classic punjabi pop
jacksonville indie
japanese pop rap
cantautora argentina
garhwali pop
carnatic vocal
norwegian singer-songwriter
nederreggae
rap francais nouvelle vague
venezuelan indie
german ska
canadian old school hip hop
nueva ola chilena
k-rock
punk 'n' roll
minneapolis indie
handpan
canadian celtic
yogyakarta indie
hyperpop en espanol
pakistani folk
irish hip hop
japanese indie pop
chaotic hardcore
classic malaysian pop
harmonica blues
jamgrass
us power metal
bangla pop
trap cristao
vintage jazz
malayalam hip hop
poezja spiewana
rap montrealais
boston punk
jazz house
fingerstyle
baltimore hip hop
drone metal
musica nayarita
indonesian edm
german ccm
folklore ecuatoriano
christmas instrumental
riddim
japanese screamo
indiana hip hop
nepali indie
fluxwork
indonesian blues
futurepop
estonian hip hop
neurofunk
vlaamse kinderliedje
michigan indie
classic dubstep
french psychedelic
psychill
czech punk
russian viral pop
american contemporary classical
burmese pop
russian folk rock
twee pop
rai algerien
chinderlieder
vietnamese idol pop
pittsburgh indie
sovietwave
symphonic power metal
bristol indie
australian talent show
speed plug brasileiro
new orleans blues
futuristic swag
manchester indie
mexican edm
geek folk
skansk musik
scottish electronic
kompa
malian blues
substep
rumba congolaise
classic bangla pop
british modern classical
classical performance
kundalini
norwegian classical
kurdish hip hop
gaita zuliana
african gospel
balkan beats
cumbia amazonica
wyoming roots
latin house
japanese dance pop
grand rapids indie
semarang indie
san diego indie
touhou
ndombolo
hinos ccb
electric bass
epa dunk
cumbia salvadorena
dutch drill
dmv rap
abstract
russian chanson
swedish progressive metal
rap regio
serbian hip hop
medieval folk
cumbia uruguaya
enka
swiss rock
chill out
hong kong indie
bozlak
japanese chill rap
russian dance pop
leipzig electronic
horrorcore
galante era
croatian rock
nova musica carioca
psychedelic folk
21st century classical
brazilian classical
tempe indie
vintage tollywood
folclor colombiano
neo-traditional country
nantes indie
rock piauiense
norske viser
experimental vocal
south carolina indie
deathrash
alternative pop
american modern classical
african reggae
pagan black metal
palestinian hip hop
kleinkunst
sung poetry
virgin islands reggae
paisley underground
viet lo-fi
trova mexicana
springfield mo indie
russian reggae
grindcore
alaska indie
finnish drill
christian punk
italian metal
folclore santiagueno
flamenco guitar
kompa gouyad
jamtronica
ontario indie
japanese indie rock
canadian post-hardcore
techengue
tape club
anime latino
huapango
chinese electropop
japanese folk
kenyan pop
memphis blues
german punk rock
modern jazz trio
dark disco
oc indie
folklore surero
jazz rock
kingston on indie
thai viral pop
malay rap
bubblegum bass
dutch americana
modern hardcore
rap maromba
brazilian house
pop peruano
musica campechana
musica popular paraense
vintage schlager
melodic groove metal
azeri pop
aggrotech
vgm remix
musica oaxaquena
middle east hip hop
kannada hip hop
french movie tunes
italian tech house
dream trance
boogaloo
mod revival
raw techno
gaian doom
nu age
salsa international
swedish metalcore
collage pop
arab trap
thai folk
horror synth
champeta
tallava
cuban alternative
american post-rock
alberta country
classical piano
zespol dzieciecy
copla
kodomo no ongaku
musica popular mineira
musica maranhense
drift
swiss hip hop
hokkaido indie
fremantle indie
bogor indie
early music ensemble
kurdish folk
uk post-hardcore
chinese minyao
singing bowl
danish alternative rock
kenyan r&b
alternative ccm
folklore boliviano
soukous
huayno peruano
blackgaze
military rap
cumbia surena
psychedelic doom
south african jazz
musica juiz-forana
instrumental bluegrass
neue volksmusik
chopped and screwed
norwegian trap
israeli folk
instrumental math rock
fidget house
funky tech house
beach house
malaysian hip hop
german jazz rap
taiwan idol pop
uk desi rap
oriental metal
rajasthani pop
ukrainian electronic
electro dub
japanese ska
irish metal
jirai kei
new tribe
lo-fi brasileiro
turntablism
new england emo
latincore
jumpstyle
hauntology
zouglou
igbo pop
french indie folk
dreamgaze
arkansas hip hop
children's choir
riddim dubstep
olympia wa indie
korean singer-songwriter
orthodox chant
new delhi indie
hong kong rock
dc hardcore
elektropunk
melbourne indie
rock viet
viet remix
chanson virale
north carolina indie
luk thung
corridos cristianos
garage pop
scottish metal
hard motivation
norwegian jazz
bluegrass gospel
motivation
electro trash
musica canaria
russian ska
chanson quebecois
instrumental acoustic guitar
progressive trance house
trinibad
piratenmuziek
speed garage
swedish heavy metal
clean comedy
japanese jazz
bolobedu house
greek indie
nyhc
spanish synthpop
balearic
reunion pop
doujin
hindustani classical
downtempo bass
latin ska
early synthpop
azeri traditional
western americana
hard industrial techno
bounce
hip hop timur
classic portuguese pop
peruvian indie
auteur-compositeur-interprete quebecois
shojo
oceania soundtrack
minimal wave
belgian techno
cuban rumba
cumbia editada
indie platense
classic nz pop
adoracion pentecostal
deep smooth jazz
korean dream pop
brass band
polish metal
hel
florida death metal
talentkonkurranse
ambient idm
italian lounge
techno rave
future bounce
acid techno
ballroom
hong kong hip hop
queercore
musica criolla
bornesange
classic k-pop
musica instrumental cristiana
euskal musica
musical advocacy
straight edge
opera
thai teen pop
cdmx indie
scottish folk
freak folk
progressive uplifting trance
kawaii edm
guitarra mexicana
canto popular uruguayo
french baroque
cha-cha-cha
utopian virtual
dakke dak
danseband
rap underground colombiano
channel islands indie
orebro indie
experimental bass
french folk pop
chinese drama ost
salsa cubana
acid jazz
sudanese pop
southern soul blues
power-pop punk
cape town indie
brutal deathcore
progressive sludge
nuevo folklore argentino
philly drill
classic progressive house
comptine
african-american classical
native american contemporary
doomgaze
black thrash
folklore peruano
dutch singer-songwriter
chinese manyao
louisville indie
nerdcore
london indie
orlando indie
zikir
brazilian thrash metal
brazilian punk rock
stride
contemporary gospel
tech trance
harpsichord
trap metal italiana
reggae catala
classic japanese jazz
turkce remix
synth punk
musica andina chilena
telugu folk
neo-progressive
canzone genovese
tin pan alley
japanese math rock
italian power metal
jump blues
west coast trap
calypso
ethiopian pop
new england americana
renaissance
morna
rabindra sangeet
avant-garde metal
sgija
gbvfi
desert blues
musique urbaine kinshasa
german post-hardcore
argentine ambient
mashup
afrobeat brasileiro
space ambient
classic nepali pop
swiss metal
rap motywacja
modern ska punk
arabic jazz
french worship
welsh indie
anarcho-punk
antilliaanse rap
rebetiko
spacewave
japanese rockabilly
glasgow indie
jazz trombone
dark hardcore
canadian indie folk
sevillanas
hard alternative
toronto rap
japanese jazz fusion
kasi rap
russian alternative rock
asheville indie
forro tradicional
528hz
kabyle
german show tunes
musik anak-anak
cowpunk
kannada pop
nu skool breaks
necrotrap
chanson humoristique
plugg francais
classical guitar
german jazz
cedm
porro
plena uruguaya
trap maroc
lo-fi latino
rap angolano
musica nicaraguense
carimbo
melanesian pop
taiwan punk
balochi pop
egg punk
estonian pop
rogaland musikk
popgaze
italian folk metal
danish modern jazz
russian metalcore
ecuadorian indie
irish indie rock
rap criolo
american post-punk
indie cordoba
nordic folk
socal indie
metal mineiro
fussball
anime drill
japanese jazztronica
nordic folk metal
brazilian progressive metal
vancouver punk
oi
children's story
arab folk
streektaal
bulgarian trap
belgian singer-songwriter
queer country
indie curitibano
chinese indie rock
kyrgyz hip hop
italian progressive rock
cuatro venezolano
vgm instrumental
seemannslieder
suomirap
k-pop reality show
rap italiano old school
finnish classical
underground rap
hyperpop brasileiro
mexican metal
musica sarda
men chika
manso indie
russian indie rock
danish indie pop
kundiman
dungeon synth
sinhala indie
frankfurt electronic
nashville americana
malaysian tamil pop
balkan brass
metal guitar
polish post-punk
hip hop cubano
mbalax
boy pop
tekno
vintage dutch pop
goregrind
czsk viral pop
brazilian groove metal
gainesville indie
bolero cubano
classic greek rock
latvian pop
ritmo kombina
nz electronic
persian electronic
spanish classical
dayton indie
electro-industrial
irish indie
japanese power metal
bayerischer rap
argentine indie rock
soulful house
turkce trap metal
keroncong
progressive death metal
mallsoft
elephant 6
israeli trap
bulgarian hip hop
man's orchestra
ulkucu sarkilar
marathi traditional
avant-garde jazz
folklore paraguayo
world chill
indie shoegaze
spanish invasion
south african deep house
cambridgeshire indie
merengue tipico
bali indie
country quebecois
tropical tecladista
chicago pop punk
ska jazz
gothabilly
japanese celtic
cristiana para ninos
nova canco
north carolina emo
german boom bap
post-post-hardcore
t-pop girl group
drill and bass
avant-garde
canadian house
jamaican ska
huayno popular
accordion
louvores pentecostais
swedish electronic
mega funk
belgian dnb
french dub
funky breaks
vietnamese bolero
slovak trap
vaqueiro
rosary
cueca chilena
new orleans funk
new wave of thrash metal
latin tech house
classic anime
cambodian pop
christchurch indie
czech singer-songwriter
electronic djent
british orchestra
japanese post-rock
danish indie
industrial pop
rap inde
space rock
sudanese hip hop
fallen angel
early reggae
folclor afrocolombiano
family gospel
deep dnb
ethio-jazz
belarusian pop
proto-techno
congolese gospel
gengetone
italian jazz
hokkien pop
pop cristiano
progressive power metal
dutch dnb
tipico
medieval
voidgaze
kizomba antigas
experimental folk
full on
thai ost
icelandic folk
swedish doom metal
greek metal
folklore nuevo argentino
tamborazo
cincinnati rap
mappila paattu
hard techno
classic finnish rock
folclore tucumano
lds instrumental
bajki
romanian rock
post-doom metal
cumbia boliviana
son cubano
c86
modern funk
irish electronic
indie dream pop
tamil worship
neru
persian rock
danish electropop
depressive black metal
norwegian folk rock
old-time
irish pub song
autonomous black metal
football
j-core
dublin indie
korean electropop
nz singer-songwriter
rap liegeois
instrumental djent
zamba
danish jazz
choral
pop ambient
downtempo deathcore
turkish punk
puerto rican folk
coupe-decale
traditional soul
australian metal
german heavy metal
old west
ilahiler
crust punk
operetta
musica santomense
classic sinhala pop
black punk
sydney indie
phleng phuea chiwit
adoracion
irish post-punk
slovak punk
semba
commons
okc indie
zen
musica ayacuchana
finnish punk
kc indie
ska espanol
yaoi
hard trance
melodic hard rock
coral gospel
nz indie
rap kreyol
garage house
gqom
jazz mexicano
uk dub
turin indie
psychokore
indonesian indie pop
svensk progg
thai pop rap
forro gospel
munich indie
ugandan pop
kizomba cabo-verdiana
sichuanese hip hop
modern old-time
canadian modern jazz
musique guadeloupe
swedish black metal
cypriot pop
vancouver metal
jazz clarinet
finnish hard rock
musica tabasquena
audiophile vocal
modular synth
arunachal indie
slow game
polish blues
krautrock
nwocr
nagpuri pop
japanese underground rap
omaha indie
tunisian pop
vintage tango
folkmusik
palestinian pop
viola caipira
dutch indie rock
korean underground rap
outsider
modern jungle
musica para criancas
israeli indie
musica capixaba
symphonic death metal
connecticut hardcore
canadian garage rock
lagu sunda
musica jalisciense
kyushu indie
ukrainian folk rock
rumeli turkuleri
library music
modern uplift
midwest americana
german country
musica sudcaliforniana
tulsa indie
gypsy punk
vietnamese pop
rock alternatif francais
dalarna indie
british contemporary classical
miami indie
outsider house
draga
buffalo ny metal
victorian britain
ukrainian post-punk
oshare kei
swedish synth
french punk
nephop
heavy alternative
deep german indie
thai bl ost
symfonicky orchestr
rap capixaba
neue deutsche todeskunst
rock chapin
brazilian hardcore
reggae peruano
modern goth
native american flute
aussie emo
okinawan folk
greek house
dutch trap
cover acustico
classic icelandic pop
blaskapelle
hiplife
funana
atlanta punk
uk worship
blasmusik
granada indie
mandolin
zimdancehall
hardtekk
swedish punk
mestissatge
funk evangelico
salsa urbana
musica madeirense
musica crista reformada
finnish indie
british country
tibetan pop
bleep techno
trondersk musikk
atmospheric dnb
nordic post-rock
dusseldorf electronic
musiikkia lapsille
corrosion
baiao
hungarian folk
chinese traditional
beat italiano
chamame
traditional folk
persian melodic rap
canterbury scene
pop costarricense
croatian hip hop
musica tropical guatemalteca
glitch pop
persian alternative
rap paranaense
duluth indie
russian synthpop
samurai trap
japanese vocal jazz
grimewave
russian trance
trival
slovenian pop
coco
technical groove metal
austrian hip hop
swing italiano
dark progressive house
scouse rap
vaportrap
hammond organ
maimouna
japanese contemporary classical
dissonant death metal
shimmer psych
gothic americana
experimental house
deep adult standards
japanese guitar
andean flute
marathi devotional
trio huasteco
austin hip hop
mecha
instrumental stoner rock
pinoy alternative rock
instrumental surf
ghanaian gospel
swamp pop
brass band pop
haitian gospel
deep latin alternative
munich electronic
432hz
kentucky punk
naat
musica istmena
german indie pop
telugu indie
russian plugg
neapolitan funk
austrian indie
deep techno
bath indie
icelandic electronic
modern cello
eugene indie
plunderphonics
musica andina colombiana
spanish reggae
dark jazz
mongolian alternative
rennes indie
long island punk
christian hardcore
kora
jazz metal
canadian hardcore
spanish folk rock
manitoba indie
balkan drill
freeform hardcore
technical thrash
48g
bass music
denton tx indie
nz children's music
drone folk
german thrash metal
zillertal
latvian hip hop
greek downtempo
eventyr
emo punk
russian folk
retro metal
post-black metal
japanese blues
piedmont blues
vintage hollywood
ambient psychill
kentucky metal
singeli
choro
swiss house
nordnorsk musikk
nova musica paulista
string duo
indian underground rap
nuevo flamenco
armenian pop
indy indie
brazilian power metal
musica indigena latinoamericana
breakcore
new orleans soul
korean indie folk
deathrock
lagu bali
classic dutch pop
jazz double bass
modern enka
amharic pop
south african choral
indie emo
russian trap metal
gothic black metal
emo trap italiana
musica baiana
turkish metal
swing revival
deep christian rock
indonesian psychedelia
swedish house
rumba catalana
jazz drums
pittsburgh rock
musica eletronica gospel
phoenix indie
spanish post-punk
charlotte nc indie
darkstep
multidisciplinary
ambient post-rock
kaneka
connecticut indie
arab groove
charanga
kolkata indie
cantautor catala
tampa indie
dutch prog
geek rock
seinen
rhode island indie
denver indie
spanish noise pop
german indie rock
virginia punk
italian trance
rap ivoire
vocal trance
jackin' house
speed house
indie valenciana
warm drone
villancicos
sepedi pop
reggae maghreb
igbo rap
deep funk ostentacao
bard
swamp blues
vermont indie
musica feirense
new mexico music
zilizopendwa
indie rock peruano
folklore chileno
deep soft rock
tamil devotional
korean trap
japanese garage rock
belarusian electronic
musica quintanarroense
british dance band
jesus movement
deep norteno
alabama metal
galician rock
deep soundtrack
classic luk thung
indie siciliano
tatar pop
neo-pagan
leeds indie
cincinnati indie
oud
christian a cappella
twoubadou
deep happy hardcore
british black metal
japanese dream pop
sambalpuri pop
lapland metal
hungarian edm
musica afroperuana
nueva trova chilena
brisbane hip hop
hexd
ambient techno
funk capixaba
ai
vincy soca
paraguayan rock
punk chileno
kurdish remix
slovenian electronic
kent indie
canadian indigenous music
persian underground hip hop
korean worship
jazz cubano
musica popular uruguaya
chant religieux
bristol electronic
classic hungarian pop
straight-ahead jazz
polish indie rock
british death metal
telugu devotional
neo metal
underground amapiano
marimba orquesta
cyber metal
deep uplifting trance
dub techno
neurostep
pinoy praise
portland punk
new orleans indie
rare groove
acidcore
brazilian percussion
wu fam
gyerekdalok
hardstyle
ghettotech
classic azeri pop
spiritual hip hop
skramz
jazz worship
lagu bugis
polish black metal
melodipop
nice indie
vienna indie
louvor icm
malayalam indie
sinhala rap
rap femenino mexicano
dub reggae
fort worth indie
hamburg indie
indie cristao
waiata maori
classic romanian pop
ohio indie
australian ska
vintage swedish pop
harp
portuguese indie
hindustani vocal
griot
slack-key guitar
minimal dub
musica mixteca
gospel drill
raboday
neotango
taiwan campus folk
spanish folk
german literature
danish post-punk
german opera
koligeet
alberta hip hop
nz folk
campursari
welsh hip hop
pakistani rock
stockholm indie
powerviolence
dark folk
belarusian rock
chasidic pop
viral pop brasileiro
funk mexicano
pennsylvania hardcore
jordanian pop
gothenburg hip hop
chinese classical piano
orquesta tipica
uyghur pop
taiwanese indie
sound art
progressive doom
lithuanian hip hop
tinku
texas hardcore
bangladeshi rock
charlottesville indie
musiqi-ye zanan
kazakh indie
schranz
punk euskera
utah indie
spa
beatboxing
soviet synthpop
bay area hip hop
western mass indie
swedish stoner rock
dunedin indie
nl folk
melodic power metal
beatdown
miami metal
novo rock gaucho
japanese heavy metal
classic hungarian rock
norwegian alternative rock
guinean pop
pakistani electronic
guided meditation
birmingham indie
czech metal
cape verdean folk
jazz organ
cinematic post-rock
world meditation
christian hard rock
lexington ky indie
chinese talent show
vocaloid metal
montenegrin pop
beats
detroit house
windsor on indie
german tech house
histoire pour enfants
black 'n' roll
taiwan rock
rock keyboard
pop paraguayo
czech country
footwork
smooth soul
west australian hip hop
chinese classical performance
experimental jazz
louisiana metal
bouyon
new orleans americana
ukrainian edm
bisaya rap
dubsteppe
tunantada
telugu worship
guatemalan pop
hamilton on indie
norsk lovsang
hyperpop italiano
maine indie
thai post-rock
uk bass
musica paraibana
progressive alternative
musique militaire
tennessee metal
venda pop
indie napoletano
college a cappella
melodic black metal
american grindcore
polish jazz
bhojpuri folk
exotica
nz christian
scottish techno
truck-driving country
synth prog
musica guerrerense
bardcore
comedia
experimental indie
epunk
gospel rap
neo-rockabilly
dancehall colombiano
kenyan hip hop
japanese indie folk
neofolk
folclore jujeno
icelandic hip hop
hungarian metal
ghent indie
oulu metal
dallas indie
bouzouki
jazzy dnb
chinese audiophile
power blues-rock
polish electronica
canadian blues
british comedy
afro house angolano
musica cabo-verdiana
alt-idol
schweizer rap
technical deathcore
musica infantil catala
anglican liturgy
lampung indie
afghan rap
polish death metal
sound effects
piano mpb
scottish hush
black comedy
trance mexicano
polca paraguaya
greek swing
japanese beats
tamaulipas indie
cornetas y tambores
north moroccan rap
voetbal
indonesian hardcore
brisbane punk
background jazz product
malawian pop
dub brasileiro
irish neo-traditional
italian gothic
italian gothic metal
musica catarinense
muzica etno
spytrack
zcc
punk cover
chinese worship
png pop
spanish indie folk
syrian hip hop
guitarra andina
lagu aceh
zambian hip hop
gospel reggae
lebanese indie
tamil indie
ukulele
dutch moombahton
psychedelic folk rock
musica yucateca
polynesian hip hop
cartoni animati
thall
chakra
charango
christian power metal
british choir
brazilian ska
raggatek
folklore venezolano
jain bhajan
slavic folk metal
psychedelic punk
ok indie
fan chant
detroit techno
austin metal
austrian dnb
grebo
bandoneon
austrian metal
candomble
c-pop girl group
broken transmission
sunnlensk tonlist
ramonescore
instrumental progressive metal
musica bautista
sorani pop
north carolina metal
action rock
sci-fi metal
mashcore
italo house
belgian indie rock
alpine yodeling
turkish electronic
indie folk argentino
deep acoustic pop
trinidadian reggae
lithuanian trap
deep idm
cameroonian pop
er ge
varmland rock
chinese folk
afro-cuban percussion
slam poetry
samoan pop
musica evangelica instrumental
bush ballad
atmospheric post-metal
newfoundland indie
halftime dnb
romanian electronic
marimba de guatemala
maithili
chamber folk
one-person band
slam death metal
nwothm
punk melodico chileno
kurdish rock
rochester ny indie
czech folk rock
hard house
tanzanian hip hop
xitsonga pop
zambian pop
armenian hip hop
spiritual jazz
austin rock
york indie
idaho indie
gambian hip hop
deep ragga
muzica crestina
musica duranguense
caucasian classical
carnaval limburg
visor
italian library music
quebec punk
trap angolano
post-disco soul
oaxaca indie
boston hardcore
danish techno
greek fem rap
vogue
rock en asturiano
bomba y plena
melbourne punk
nuevo tango
german prog
psych gaze
corridos adictivos
tamazight
modern progressive rock
british grindcore
nordic contemporary classical
vintage chanson
dc indie
polish prog
berlin school
uk82
zim urban groove
moog
marathi remix
experimental electronic
polish synthpop
sinaloa indie
death 'n' roll
persian traditional
hungarian underground rap
ska catala
blues latinoamericano
makossa
afro-funk
dansei seiyu
southampton indie
rockabilly en espanol
rock of gibraltar
technical melodic death metal
sami
cleveland metal
deep contemporary country
british post-rock
jazz vibraphone
baltic classical
korean drill
nz dnb
scottish hip hop
canadian underground hip hop
muzika l'yeladim
italian electronica
israelite hip hop
christmas product
rosario indie
mewati pop
israeli jazz
norwegian house
gothic alternative
tuareg guitar
asakaa
musica popular amazonense
afrikaans hip hop
appalachian folk
hardgroove
scratch
korean electronic
flick hop
slovenian indie
devon indie
israeli techno
accordeon
malaysian punk
cosmic post-rock
jazz catala
australian ambient
belgian metal
music hall
cruise
american primitive
norrlandsk hip hop
swahili gospel
korean superband
usbm
marwadi pop
malayalam madh
khayal
waiata mo tamariki
russian ccm
2-step
indian electronic
uk christian rap
italian renaissance
rap tico
classic korean pop
fijian pop
martial industrial
new york death metal
dancehall chileno
detskie pesni
chamber orchestra
subliminal product
musica portuguesa contemporanea
tearout
emotional black metal
psicodelia chilena
cosmic death metal
fictitious orchestra
st louis drill
musique comorienne
hungarian punk
chinese indie pop
vinahouse
classical cello
street punk espanol
swiss trap
bemani
rap metal espanol
orchestral performance
brazilian modern jazz
paidika tragoudia
latmiya
batida
puerto rican indie
sambass
hungarian classical performance
folklore uruguayo
hindustani instrumental
cook islands pop
psalmen
fake
sitar
greek contemporary classical
karaoke
ecuadorian alternative rock
palestinian alternative
israeli classical piano
dominican indie
italian punk
deep gothic post-punk
math pop
peruvian punk
musica michoacana
neo kyma
rap feminino chileno
polyphony
mumbai indie
classic italian folk pop
viking black metal
wassoulou
south african underground rap
ryukyu ongaku
rap chretien
yugoslav new wave
jig and reel
chaabi marocain
breton folk
quebec death metal
punk catala
modern psychedelic folk
chinese soundtrack
zim hip hop
tuna
musica nublensina
south asian metal
ukrainian classical piano
mongolian hip hop
crack rock steady
danzon
kumaoni pop
malayalam cover
bomba
violao classico
bangladeshi indie
newcastle indie
violin
tassie indie
bagpipe
graz indie
mpb gospel
australian indigenous hip hop
sega mauricien
cumbia cristiana
rock curitibano
deep dubstep
garage punk
spanish techno
balkan punk
ambient synth
french garage rock
warrington indie
khortha pop
portland metal
gospel singers
rva indie
uwielbienie
goralski
eritrean pop
slavic metal
taiwan instrumental
garage punk blues
vegan straight edge
mandible
clap and tap
buffalo ny indie
remix product
japanese boom bap
christian dance
kids hip hop
salsa cristiana
deep disco
swedish hardcore
bahai
musique pour enfant quebecois
ukrainian folk pop
macedonian pop
lafayette indie
igbo trap
chhattisgarhi pop
gulf hip hop
memphis americana
bahamian pop
shoegaze brasileiro
cavernous death metal
new wave of glam metal
finnish new wave
lldm
slushwave
modern swing
serbian electronic
sanfona
naija old school
american 21st century classical
west african jazz
urban kiz
japanese melodic punk
punk rock italiano
british industrial
deep progressive rock
british experimental
military band
wrock
japanese hyperpop
rogaland indie
northeast indian indie
magyar retro dance
sheilat
detroit trap en espanol
dennery segment
swedish rockabilly
rap portuense
kuduro
detske pisnicky
deep big room
japanese psychedelic
didgeridoo
irish rebel song
ambient trance
uppsala indie
mississippi indie
pop catracho
faroese pop
rwandan pop
french black metal
indonesian underground hip hop
japanese electronic
uk beatdown
ukulele cover
pornogrind
new isolationism
norwegian americana
musica hondurena
trio batak
jazz harp
panpipe
cancoes infantis
swiss folk
indonesian metal
jazz brass
louange
hmong pop
comedienne
manipuri pop
sonora indie
german black metal
argentine metal
south african soulful deep house
czsk reggae
polish folk metal
solomon islands pop
concert band
drill beats
kansai indie
san antonio rap
svensk lovsang
hamburger schule
modern darkwave
brazilian post-hardcore
musica jibara
guyanese pop
derby indie
norwegian punk rock
spanish electronic
danish singer-songwriter
spanish prog
traditional british folk
italian new wave
hindi worship
american melodeath
persian drill
deep progressive trance
worcester ma indie
telugu remix
chain punk
musica lombarda
jewish hip hop
cypriot hip hop
bulgarian rock
swiss techno
ambient country
swedish folk pop
greek guitar
psybass
vintage broadway
portuguese folk
flemish folk
swedish prog
musicas espiritas
jalsat
garage psych
gospel italiano
throat singing
rap pernambucano
japanese worship
lancaster pa indie
chinese jazz
memphis indie
neo-kraut
musica aguascalentense
rusyn folk
persian sad rap
punta
sungura
stateside dnb
tucson indie
slovenian rock
punta rock
stomp and whittle
deep deep house
dronescape
glitch beats
plugg en espanol
euskal indie
muzica copii
ambient black metal
makina
musica pitiusa
dub punk
leipzig indie
drill dominicano
indian percussion
festigal
polish contemporary classical
german pagan metal
pittsburgh metal
contrabass
norwegian space disco
ukrainian contemporary classical
kelowna bc indie
folk black metal
bass trip
hungarian techno
moderne ludovky
mongolian pop
indie electronica
malayalam worship
lagu sasak
banda guanajuatense
english renaissance
light music
deep progressive house
chicano punk
guitarra clasica
halifax indie
dancehall guyanaise
lancashire indie
columbus ohio indie
oth indie
cuento infantile
kenyan drill
baptist gospel
czech indie
jazz puertorriqueno
singaporean electronic
armenian folk
pashto pop
canadian psychedelic rock
detske pesnicky
german dnb
northern irish punk
trad quebecois
future ambient
spanish rockabilly
aarhus indie
italian folk
rap galego
swiss alternative rock
solipsynthm
brazilian techno
fast melodic punk
libyan pop
american romanticism
northeast indian hip hop
erotica
atmospheric sludge
arabic instrumental
swiss indie folk
brazilian dnb
acid trance
rap metalcore
bossa nova jazz
highlife
deep liquid
psydub
broken beat
old school hard trance
power thrash
corsican folk
deep soul house
musikkorps
romanian folk
psalms
austin singer-songwriter
sega
magyar mulatos
limerick indie
xhosa
russian techno
zurich indie
minimal dnb
hungarian indie
indie psych-pop
greek rock
industrial techno
mexican traditional
vintage italian pop
experimental synth
swiss singer-songwriter
rasiya
nitzhonot
gambian pop
canadian experimental
swiss reggae
deep brazilian pop
capoeira
metal gotico
finnish pop punk
deep liquid bass
kenyan alternative
freakbeat
spirituals
drone ambient
orquestas de galicia
irish punk
mezmur
punk tuga
french post-punk
experimental guitar
boogie-woogie
musica costarricense
german dark minimal techno
singaporean hip hop
texas punk
forest psy
serialism
reiki
gamecore
erotik
swedish techno
dirty texas rap
australian blues
blackened screamo
vintage cantonese pop
french dnb
indie singer-songwriter
cosmic black metal
nordic ambient
musica potiguar
russian dnb
popullore jugu
technical black metal
bansuri
soul flow
greek psychedelic rock
klapa
electronica chilena
birdsong
reggae mexicano
puglia indie
deep new wave
somali pop
brazilian tech house
australian experimental
ukhc
8-bit
pop boliviano
indorock
uk stoner rock
south african country
canadian indigenous hip hop
indie folk italiano
bible
berlin minimal techno
minimal dubstep
austro-german modernism
deep metalcore
japanese experimental
nz gangsta rap
persian trap
irish classical
italian ska
mbira
japanese girl punk
shamisen
focus trance
indie veneto
south african r&b
musica nortena chilena
gypsy fusion
kansas indie
russian pop punk
purple sound
dunedin sound
japanese edm
technical brutal death metal
outer hip hop
rap moldovenesc
japanese traditional
pinoy metal
punjabi folk
edinburgh indie
classic moroccan pop
laulaja-lauluntekija
uruguayan indie
kids dance party
erotic product
surinamese pop
post-punk mexicano
drill tuga
belgian new wave
classic bulgarian pop
joropo
arkansas indie
italian contemporary jazz
west virginia indie
jazz venezolano
mizo pop
southern china indie
language
destroy techno
lezginka
oberkrainer
dancehall mauricien
stl indie
dutch blues
lund indie
pacific islands gospel
lagu sabahan
indie pop rock
musica occitana
vlaamse rap
turkish reggae
contemporary folk
spacesynth
string folk
powwow
german melodeath
minneapolis punk
wyoming indie
deep neofolk
detroit indie
country boogie
east anglia indie
belgian jazz
milwaukee hip hop
romanian indie
canadian post-punk
yoruba worship
khmer hip hop
dutch jazz
finnish progressive metal
malagasy pop
korean soundtrack
afro psych
vispop
madrigal
chill baile
drumfunk
spanish indie rock
experimental club
thrash core
hardcore punk espanol
indie rock colombiano
norrbotten indie
zydeco
sierra leonean pop
christlicher rap
southeast asian post-rock
bisrock
german street punk
kyrgyz pop
russian shoegaze
cantaditas
japanese idm
brazilian experimental
little rock indie
traditional scottish folk
salay
malawian hip hop
belgian electronic
cologne electronic
american choir
venda rap
gamelan
swedish psychedelic rock
tango cancion
british math rock
musica mocambicana
purulia pop
progressive breaks
argentine hardcore
guitarra argentina
irish dance
punk colombiano
new wave of osdm
african electronic
north dakota indie
minneapolis metal
danish black metal
dark psytrance
baltic post-punk
panamanian rock
deep ambient
denver metal
hengelliset laulut
trallpunk
early music choir
samba gospel
brazilian indie rock
dutch black metal
chattanooga indie
navajo
santali pop
musique tahitienne
german blues
mexican son
nordic shoegaze
afrobeat fusion
indonesian trap
yoga
uk noise rock
barbershop
finnish black metal
rap guarulhense
tunisian alternative
psychedelic jazz fusion
sefardi
irish drill
italian mandolin
classical harp
galego
pei indie
myanmar indie
canadian psychedelic
australian techno
traditional rockabilly
german electronica
ney
house argentino
lithuanian indie
deep southern trap
vlaamse cabaret
ottawa indie
russian nu metal
khandeshi pop
musique acadienne
ragtime
cabaret
vintage chinese pop
nohay
rock tico
banda peruana
marimba mexicana
american orchestra
abstract idm
brazilian blues
russian pixel
ny roots
sasscore
voidgrind
assyrian pop
malaysian tamil rap
jazz violin
estonian rock
greenlandic pop
japanese psychedelic rock
erhu
celtic harp
ruta destroy
taiwan post-rock
belgian modern jazz
montana indie
euroska
neo-psicodelia brasileira
western saharan folk
pahadi pop
musica calabrese
deep melodic hard rock
luxembourgian indie
south african electronic
finnish jazz
synthwave brasileiro
turkish post-punk
vaudeville
portuguese metal
boogie
trap cristiano
guidance
barnalog
australian comedy
slovak folk
dutch musical
piano house
deep german punk
psychedelic blues-rock
gospel amapiano
new wave of speed metal
deep east coast hip hop
manitoba country
hip hop reunionnais
friese muziek
caracas indie
essex indie
tzadik
galician folk
klezmer
musica mapuche
jazz guitar trio
german death metal
traditional reggae
string band
ambient dub techno
wisconsin indie
swedish post-hardcore
thai instrumental
adelaide indie
new weird finland
son cubano clasico
georgian hip hop
dark electro
musica goiana
humppa
calgary indie
albany ny indie
uilleann pipes
post-punk latinoamericano
technical grindcore
musica indigena mexicana
polish hardcore
fo jing
musica mallorquina
lo star
judaica
chinese instrumental
nz metal
chicago mexican
euskal reggae
deep funk house
indonesian death metal
circus
austrian black metal
speedcore
portuguese techno
joseon pop
georgian alternative
indonesian emo rap
finnish progressive rock
cleveland indie
deep flow
talentos brasileiros
cybergrind
grunge pop
norwegian contemporary jazz
psybreaks
african percussion
folklore veracruzano
gothic post-punk
szanty
polish folk
sinogaze
ukrainian alternative rock
forro manauara
blues-rock guitar
byzantine
metal colombiano
rap tuga underground
finnish reggae
underground boom bap
tijuana indie
macedonian hip hop
old school highlife
atmospheric doom
georgian pop
taiwan electronic
classic danish rock
rap congolais
hip hop galsen
epic doom
french folk
experimental techno
talentkonkurrence
mexican tech house
folklore cuyano
russian heavy metal
palestinian traditional
isle of wight indie
latvian indie
lagu karo
electronicore
washboard
australian classical
crossover prog
ukrainian folk
therapy
finnish soul
atlantic canada hip hop
neo-crust
cork indie
marching band
experimental indie rock
canadian post-rock
blackened crust
street band
electronica venezuela
darbuka
italian post-punk
kashmiri pop
rap ecuatoriano
norwegian death metal
noise punk
cameroonian hip hop
barockinterpreten
bmore
west-vlaamse hip hop
euskal metal
tanzlmusi
mallet
maluku pop
neo-trad metal
bolivian rock
junior songfestival
progressive thrash
bisaya indie
pasodobles
hard minimal techno
gnawa
jazz orchestra
umea hardcore
finlandssvenska musik
emocore
ilocano pop
belarusian punk
norwegian gospel
lagu tarling
korean shoegaze
rock progressif francais
bisaya worship
rap catarinense
electronica peruana
ukrainian experimental
nordic classical piano
florida hardcore
traditional ska
thai metal
franco-flemish school
dutch experimental electronic
finnish doom metal
traditional english folk
canadian death metal
musica pernambucana
kalmar indie
norwegian prog
ukrainian metal
zim gospel
narodnozabavna
croatian indie
bachchon ke geet
russian classical piano
new england metal
komedi
czsk hyperpop
rock gotico
deep folk metal
canberra indie
blues mexicano
hip hop boliviano
balfolk
jewish a capella
japanese house
sesotho pop
musica mexiquense
musica valenciana
modern jangle pop
dark ambient
faroese indie
greek black metal
deep freestyle
noisecore
american oi
balkan post-punk
grenada soca
dainuojamoji poezija
military cadence
bodo pop
musique touareg
myanmar hip hop
emoviolence
azeri alternative
indie tico
musique mariage algerien
lithuanian rock
indie campechano
albanian rock
punk galego
massage
italian metalcore
virginia indie
french hardcore
maine hip hop
taraneem
tibetan mantra
bangladeshi hip hop
estonian electronic
pune indie
italian post-hardcore
iowa hip hop
musica antigua
swiss worship
lagu manado
tijuana electronic
xinyao
japanese classical piano
swedish experimental
russian emo
swiss black metal
russian post-rock
swedish underground rap
winnipeg hip hop
avant-garde black metal
classic tollywood
knoxville indie
mincecore
musica sammarinese
australian hardcore
forro instrumental
bajan soca
bosnian indie
louisville underground
czech alternative rap
korean bl ost
bangalore indie
chimurenga
trash rock
togolese pop
uk diy punk
cornwall indie
montana roots
brasilia indie
canadian comedy
electronica cristiana
deep dance pop
yemeni pop
modern big band
bagpipe marching band
gospel soul
muzica usoara
brazilian death metal
krajiska muzika
spanish experimental
tribute
german classical piano
musica paranaense
london on indie
japanese bedroom pop
kannada bhava geethe
german hardcore
dresden indie
hi-tech
psychedelic space rock
australian jazz
pre-war blues
polka nortena
slovak electronic
hausa pop
indonesian hyperpop
oslo indie
college marching band
black death
cascadian black metal
latino comedy
classical trumpet
raspe
beach music
italian death metal
polyphonies corses
dikir barat
icelandic post-punk
second line
finnish metalcore
stuttgart indie
cascadia psych
texas death metal
deep melodic death metal
bornehistorier
hjemmesnekk
canadian black metal
polish thrash metal
seattle metal
muzica moldoveneasca
d-beat
nyc metal
finnish electro
acousmatic
backing track
mindfulness
traditional funk
michigan folk
breaks
dessin anime
irish banjo
ukrainian black metal
igbo traditional
malmo indie
latvian rock
finnish worship
german stoner rock
deep funk
musica de intervencao
rap gaucho
danish death metal
mexican death metal
dub metal
milwaukee indie
cantonese worship
lasten satuja
musique nigerienne
indonesian deathcore
kabyle moderne
russian old school hip hop
street punk
algerian folk
underground grunge
japanese classical performance
classical soprano
ua trap
sevilla indie
reggae tico
zenonesque
old school nederhop
pinoy edm
cymraeg
slovak indie
afrikaans gqom
noel quebecois
odia bhajan
turkish classical performance
rwandan gospel
kuduro antigo
swedish blues
turkish classical
rap abc paulista
polish techno
rock campineiro
italian jazz fusion
neo grime
algorave
canadian rockabilly
cardiff indie
zambian gospel
cornish folk
japanese post-punk
hard rock mexicano
kansas hip hop
spanish jazz
south dakota indie
adivasi pop
kokborok pop
fuji
historic piano performance
melbourne hip hop
portuguese indie rock
malagasy folk
french oi
arizona punk
musica colombiana instrumental
russian romance
japanese death metal
rautalanka
gabonese pop
rock cearense
heligonka
greek folk
lounge house
mexican experimental
northwest china indie
mexican hardcore
singaporean indie
baja indie
jazz flute
liechtenstein
german post-punk
native american hip hop
deep psychobilly
classical jazz fusion
go-go
sesotho hip hop
uzbek hip hop
muzica populara
perth hip hop
anthem
bulgarian r&b
lawrence ks indie
death doom
bal-musette
dutch death metal
deep darkpsy
rock paraibano
balinese traditional
kritika
doomcore
ugandan gospel
australian post-rock
metal catala
musica eletronica brasileira
native american spiritual
schwyzerorgeli
khmer
italian pop punk
canadian drill
old school uk hip hop
indian metal
ethiopian hip hop
murga
tigrigna pop
hull indie
grunneger muziek
power noise
musica etnica
norwegian doom metal
whale song
danish punk
hardcore breaks
ostschlager
new tejano
beninese pop
prog quebec
black speed metal
japanese techno
swedish post-punk
prepared piano
norman ok indie
australian death metal
german renaissance
brass ensemble
dundee indie
taiwanese indigenous music
deep punk rock
classic sudanese pop
rap sureno chileno
estonian indie
chaabi algerien
balkan folk metal
hypnosis
fado antigo
comptine africaine
argentine jazz
finnish folk
xhosa hip hop
goa hip hop
jumptek
musique mahoraise
surinamese hip hop
serbian indie
medieval black metal
punk mexicano
meenawati
mongolian folk
persian neo-traditional
swedish pop punk
russian experimental electronic
jazz accordion
australian post-punk
hampton roads indie
indie salvadoreno
saraiki pop
contemporary choir
norwegian psychedelic
west yorkshire indie
uk rockabilly
cambodian rock
harmonica jazz
chilean metal
nisiotika
kerkkoor
scottish indie folk
deep vocal jazz
juju
japanese progressive house
czech electronic
orquesta tropical
czsk electropop
mexican classical
cocuk masallari
rap salvadoreno
symphonic melodic death metal
experimental psych
icelandic jazz
bloco
dansk lovsang
musiikkia lapista
neo soul-jazz
indie michoacano
bulgarian electronic
turkmen pop
carnatic instrumental
baltic folk
icelandic metal
rock goiano
chinese electronic
konkani pop
chennai indie
chant basque
christian deathcore
lao hip hop
classic tunisian pop
maltese pop
blackened hardcore
scottish gaelic folk
steel guitar
chabad niggunim
norwegian experimental
slovenian folk
coventry indie
quarteto gospel
arpa grande
musica sul-mato-grossense
nz jazz
string quartet
burundian pop
malaysian metal
free folk
honky-tonk piano
musica andorra
britcore
mezwed
modular techno
gotlandsk musik
meyxana
sean-nos singing
old school ebm
mluvene slovo
skinhead oi
basque folk
igbo worship
gospel blues
deep sunset lounge
detski pesnichki
ukrainian ccm
musique mandingue
nueva ola peruana
scottish fiddle
welsh folk
weightless
spanish renaissance
danish experimental
portuguese black metal
swiss jazz
nu electro
heavy gothic rock
lao pop
tavern
iowa indie
north alabama indie
bohemian baroque
banjara pop
dubstep product
rap norteno chileno
japanoise
uae indie
indie cantabria
epic black metal
israeli metal
inuit pop
nz hardcore
spanish electropop
yorkshire folk
georgian folk
drikkelek
geinin song
japanese prog
garage rock mexicano
progressive black metal
korean metal
classic afrobeat
boston electronic
brazilian lo-fi rock
cambridge choir
haur kantak
afrikaans gospel
musica purepecha
albanian alternative
birthday
wind symphony
italian stoner rock
kaseko
taiwan metal
serbian alternative rock
chinese metalcore
sebene
sulawesi indie
japanese choir
barnasogur
slaskie piosenki
funeral doom
swedish rock-and-roll
duduk
musica wixarika
industrial black metal
polka
screamocore
comfy synth
fado de coimbra
university choir
classical saxophone
banda de viento
georgian electronic
psytech
bleakgaze
finnish idol pop
taiwanese pop
guam indie
galician jazz
musica guineense
nova musica amazonense
swansea indie
rap guineen
seggae
maracatu
pohadky
vintage taiwan pop
old-time fiddle
psicodelia mexicana
deep discofox
maloya
afro-cuban traditional
musica brasiliense
telugu hip hop
slovenian hip hop
south carolina metal
rondalla
choro contemporaneo
siberian folk
polish ambient
heavy psych
russian folk metal
cajun
irish techno
experimental black metal
wellington indie
shakuhachi
muzica lautareasca
kinderliedjies
hammered dulcimer
faroese rock
belgian blues
korean hyperpop
icelandic black metal
ambient fusion
classical organ
finnish blues
hot jazz
starogradska
war metal
adelaide punk
kashmiri hip hop
progressive technical death metal
traditional bluegrass
tennessee experimental
khasi pop
panamanian indie
jazzcore
oriental classical
yu-mex
musica chiapaneca
musica indigena brasileira
austrian techno
scottish jazz
goa trance
sludgecore
atmospheric post-rock
mexican thrash metal
mevlevi sufi
hard glam
burkinabe pop
musica otavalena
indian jazz
nova musica maranhense
acid idm
polish modern jazz
mexican post-rock
hazaragi pop
estonian folk
pittsburgh indie rock
chamorro pop
aggro chileno
melodic doom
greek indie rock
french stoner rock
lapland hip hop
italian emo
rap mocambicana
native american metal
hypnotic techno
vietnamese electronic
dambora
shanghai indie
viola da gamba
convent
deep psytrance
poznan indie
serbian folk
surabaya indie
triangle indie
french emo
portuguese jazz
slovenian metal
haryanvi ragni
indie canario
son jarocho
japanese concert band
lovecraftian metal
classic psychedelic rock
reading
deep downtempo fusion
ngoni
dicsoites
austrian jazz
cape breton folk
ambient industrial
guzheng
namibian pop
latin shoegaze
rap euskera
dutch classical piano
german post-rock
bosnian electronic
banda militar
protest folk
belgian contemporary classical
classical mandolin
bluegrass fiddle
belgian black metal
modern string quartet
free improvisation
maltese hip hop
melodic progressive metal
nordnorsk rap
trap boliviano
lastelaulud
icelandic punk
deep classic garage rock
chapman stick
gumbe
norwegian hardcore
women's choir
koledy
polish psychedelia
italian experimental
musica queretana
australian black metal
norwegian techno
concertina
bandolim
sacred steel
metal ecuatoriano
dusseldorf indie
downtempo fusion
marathi hip hop
swedish classical
macedonian folk
boeremusiek
forest black metal
swiss country
full on groove
haitian dance
finnish modern jazz
vocal ensemble
chechen pop
arpa paraguaya
merida indie
latvian folk
hawaiian indie
sunset lounge
tibetan hip hop
deep g funk
new hampshire indie
vaikiskos dainos
italian black metal
thai shoegaze
spanish progressive rock
slovenske chvaly
indiana indie
early american folk
rap ecuatoguineano
basel indie
brazilian black metal
lowercase
rap malien
korean jazz
scottish americana
rap nica
dark minimal techno
arab metal
rotterdam indie
death industrial
musica tradicional dominicana
indonesian shoegaze
finnish post-punk
lagu iban
south african modern jazz
british classical piano
viet instrumental
combos nacionales
benga
rock caipira
medway sound
edo old school
karbi pop
techno argentina
ukrainian metalcore
folk siciliana
nyckelharpa
malang punk
noise
via
cuban funk
british brass band
sufi chant
brazilian metalcore
experimental dub
greek punk
vintage reggae
contemporary classical piano
dutch punk
finnish tango
salzburg indie
musica cearense
irish accordion
mathgrind
canti alpini
bhutanese pop
frankfurt indie
barrelhouse piano
tongan pop
black sludge
shoegaze chileno
peruvian metal
math rock latinoamericano
c64
fado instrumental
danish classical
rap gabonais
rwandan hip hop
demoscene
tajik pop
rez country
veena
power electronics
musica morelense
russian hardcore
south african metal
leon gto indie
indie fuzzpop
oeteldonk
chamber choir
seychelles pop
german rockabilly
djecje pjesme
folk metal latinoamericano
baps
steelpan
sda choir
rio grande do sul indie
illbient
ryukoka
occult black metal
lesotho traditional
denver rap
sundanese traditional
coptic hymn
marrabenta
belgian death metal
irish black metal
latvian electronic
cuatro puertorriqueno
spanish post-rock
italian contemporary classical
deep hardtechno
tuna universitaria
neo-manele
finnish choir
greek techno
uk post-metal
vintage country folk
japanese dub
qanun
trikiti
latin surf rock
japanese orchestra
alternative metalcore
italogaze
australian classical piano
nz alternative rock
guitar case
metal gaucho
derry indie
lowlands hardcore
chamame brasilero
ritual ambient
chinese post-rock
french post-rock
classic australian country
yoik
german orchestra
classical clarinet
russian contemporary classical
galician indie
dub poetry
dortmund indie
brno indie
myanmar gospel
ugandan hip hop
pops orchestra
belgian post-rock
baroque ensemble
norwegian folk
russian orchestra
gaita
mexican techno
swedish fiddle
macedonian electronic
italian doom metal
yakut pop
brockton hip hop
nz punk
irish fiddle
finnish experimental
coldwave
portsmouth indie
romanian metal
french renaissance
sarod
fort wayne indie
turkish death metal
volkstumliche musik
firenze indie
canadian classical piano
musica sergipana
indonesian neo-psychedelia
keller synth
cifteli
gothic doom
tarantella
drama
finnish hardcore
quebec hardcore
swedish emo
swedish contemporary classical
rap toscana
sotalaulut
deep filthstep
deep eurodance
brass band brasileiro
modern chamber music
south african punk
medimeisterschaften
indie poblano
trondheim indie
israeli punk
dutch underground hip hop
chinese reggae
isle of man indie
magyar musicalek
bernu dziesmas
radio symphony
decije pesme
re:techno
raw black metal
metal paranaense
oulu indie
ancient mediterranean
ohangla
idol game
cello ensemble
indie paraense
rap alagoano
musica prehispanica
taiwan classical performance
clawhammer banjo
romanian punk
missouri indie
spanish classical piano
polish experimental electronic
italian hardcore
classic latvian pop
jazz dominicano
botswana hip hop
shib
electroacoustic improvisation
west virginia metal
lute
indie boliviano
oratory
austrian punk
karen pop
syro-aramaic chant
chill-out trance
balalaika
vintage norwegian pop
kompa chretien
instrumental death metal
mizo gospel
bern indie
san antonio indie
rap sergipano
japanese melodic hardcore
fisarmonica
jug band
drone rock
post-punk brasileiro
musica folk asturiana
swedish ebm
french rock-and-roll
oxford choir
lombok indie
tamburica
austrian stoner rock
luxembourgian pop
modern mod
reggae boliviano
tuvan folk
canadian shoegaze
hong kong tv drama
chinese new year
skweee
diy pop punk
italian classical piano
swedish choir
muzica bisericeasca
galway indie
new england hardcore
rock catracho
chinese metal
neo-trad prog
iraqi hip hop
jazz chileno
bosstown sound
japanese black metal
rominimal
ohio hardcore
hungarian contemporary classical
finnish psychedelic rock
rap paraguayo
hypertrance
canzone siciliane
christian death metal
irish contemporary classical
swazi pop
australian shoegaze
nubian traditional
classic ukrainian pop
staff band
traditional southern folk
rock alagoano
indie sudcaliforniano
trap kreyol
catalan folk
jazz tico
russian black metal
ringtone
danish folk
singaporean metal
muzica ardeleneasca
russian choir
cuban electronic
austrian orchestra
icelandic traditional
bulgarian folk
kannada indie
musica piauiense
kol isha
terrorcore
lagu maluku
houston indie
rap nortista
cathedral choir
folclore portugues
croatian metal
svensk indie
paraguayan indie
musique urbaine brazzaville
cumbia funk
industrial hardcore
pilates
armenian indie
zarzuela
korean musicals
faroese folk
libyan hip hop
russian power metal
tibetan traditional
viet edm
chamber ensemble
polish post-rock
indian ambient
deep hardcore
belgian punk
new jack smooth
mountain dulcimer
pontian folk
musica campista
turkish experimental
deep melodic metalcore
arkansas metal
japanese hardcore
wisconsin metal
paracana
italo beats
dub product
pinoy shoegaze
prague indie
jazz tuba
norwegian punk
native american black metal
irish flute
baton rouge indie
guitarra portuguesa
tabla
wuhan indie
indian violin
dansk comedy
colombian hardcore
horror punk brasileiro
colorado hardcore
new brunswick indie
chinese post-punk
grisly death metal
indie psychedelic rock
dungeon rap
swedish grindcore
avant-rock
colombian electronic
vintage french psychedelic
bulgarian indie
animegrind
musique mauritanienne
hungarian classical piano
neo-industrial rock
goa psytrance
finnish electronic
modern electroacoustic
chinese classical
guatemalan metal
musica menorquina
indie hidalguense
poetry
kinderchor
tar
deep jazz fusion
nagaland indie
australian thrash metal
italian post-rock
hardingfele
vintage spanish pop
dechovka
trekkspill
south sudanese pop
musica ecuatoguineana
irish underground rap
japanese buddhist chant
christian thrash metal
botswana pop
historically informed performance
spanish blues
american early music
baithak gana
xenharmonic
neo honky tonk
indie trujillano
utah metal
oromo pop
german shoegaze
metal tico
rock progresivo mexicano
bahamian folk
eastern bloc groove
greek jazz
afghan traditional
gotico brasileiro
musica rapa nui
deep full on
vintage swing
bengali folk
candombe
covertrance
spanish psychedelic rock
indonesian experimental
santoor
belgian stoner rock
arab experimental
dragspel
abstractro
caucasian classical piano
irish gaelic folk
balafon
unblack metal
chinese experimental
javanese gamelan
garifuna folk
lai hla
marcha funebre
indie hidrocalido
totalism
spanish baroque
classic konkani pop
norwegian blues
streichquartett
yuri
belarusian metal
st petersburg fl indie
musique concrete
rajasthani folk
swiss punk
mainland se asia metal
circassian folk
taiko
canadian choir
jazz colombiano
medieval ensemble
scottish drill
indie arequipeno
minimal synth
classical flute
latin american heavy psych
lithuanian folk
irish trap
molam
bolivian metal
grunge revival
classic female blues
batswana traditional
jugendchor
alandsk musik
muzica maramureseana
duhovne pjesme
gaddiyali pop
min'yo
rap gasy
korean experimental
australian rockabilly
aberdeen indie
romanian black metal
thai worship
israeli traditional
christian symphonic metal
andalusian classical
folclore castilla y leon
folk cantabria
men's choir
marinera
himalayan folk
luxembourgian hip hop
raga rock
trio cubano
classical mezzo-soprano
brazilian rockabilly
russian death metal
italian screamo
kosovan indie
brazilian stoner rock
macedonian indie
garo pop
nhac thieu nhi
dutch folk
cape breton indie
classical percussion
rock potiguar
pinoy traditional
senegalese traditional
classical countertenor
brazilian contemporary classical
koto
bangla gojol
korean punk
croatian folk
dombra
rap potiguar
sindhi
hula
grim death metal
prank
neo-proto
danish electro
novos talentos brasileiros
israeli classical
classical baritone
rhythm rock
colombian death metal
german choir
classic assamese pop
finnish techno
zeuhl
colombian black metal
portuguese contemporary classical
lagu betawi
kinnauri pop
korean classical performance
rock nica
french classical piano
otroske pesmice
dutch punk rock
umea indie
cantonese opera
dutch contemporary classical
sinhala edm
metal noir quebecois
danish hardcore
mising pop
polynesian traditional
deep free jazz
glitter trance
scottish smallpipe
deep vocal house
post-punk colombiano
brass quintet
canadian contemporary classical
maghreb
musique peule
indonesian bamboo
slc hardcore
rock sergipano
malawian folk
finnish rockabilly
hakkapop
portuguese death metal
dutch stoner rock
saxophone trio
marimba
vintage finnish jazz
dhrupad
western ny metal
euro hi-nrg
russian jazz
musica colimense
deep northern soul
indian instrumental rock
minnesota metal
northamptonshire indie
canadian stoner rock
epic collage
ho munda
nyahbinghi
kentucky mountain folk
mento
irish ballad
italian blues
estonian metal
muzica banateana
piada
dytyachi pisni
classical trombone
italian progressive metal
appalachian black metal
zither
hangoskonyvek
swiss experimental
metal salvadoreno
guggenmusik
izvorna muzika
experimental percussion
dark black metal
bikutsi
tanzorchester
lok dohori
american classical piano
singaporean punk
anime game
eletronica underground brasileira
italian modern prog
salon music
classical accordion
iranian experimental
thrash-groove metal
polish classical piano
kikuyu pop
chilean techno
hungarian black metal
kolo
welsh choir
bulgarian metal
edinburgh metal
dogri pop
guatemalan indie
dutch baroque
czsk black metal
quebec metal
borneo traditional
rozpravky
vintage radio show
alabama hardcore
kikuyu gospel
moravian folk
experimental big band
macedonian rock
dutch experimental
norwegian choir
musique soninke
orquesta cubana
chinese wind
pipa
cerkes muzikleri
rakugo
delaware indie
sardinia indie
punk ecuatoriano
tulum
african metal
autoharp
assamese hip hop
musique ancienne
kapa haka
classic nz country
croatian electronic
rock dominicano
indie asturiana
musica blumenauense
stubenmusik
synthetic classical
rock in opposition
frafra
field recording
ceske chvaly
middle eastern traditional
albanian folk
vintage hawaiian
deep indie singer-songwriter
detskie rasskazy
chinese punk
rock pernambucano
blues band
christian doom metal
spanish death metal
santur
folklore panameno
early french punk
italian soprano
mapouka
deep italo disco
rock catarinense
french experimental rock
serbian metal
rongmei pop
black noise
ceilidh
caucasian folk
russian thrash metal
sound collage
irish experimental electronic
indonesian thrash metal
haitian traditional
slovak metal
gwoka
indie queretano
metalcore espanol
belgian hardcore
korean traditional
malaysian hardcore
lithuanian metal
italian baritone
ukrainian choir
shehnai
german contemporary classical
finnish contemporary classical
musica mato-grossense
beat poetry
brazilian heavy metal
deep swedish rock
belgian experimental
macau pop
kosovan folk
djembe
instrumental black metal
alpenpanorama
baroque singing
slash punk
musica amapaense
trombone brasileiro
pontianak indie
african experimental
suomisaundi
vapor house
dweilorkest
indie nica
nordic orchestra
electroacoustic composition
musica acoriana
saxony metal
ladakhi pop
normal indie
alaska hip hop
mexican power metal
musica campineira
bandura
lincoln ne indie
soda pop
danish choir
guqin
recorder
vintage classical singing
british electroacoustic
georgian polyphony
latin american classical piano
spanish stoner rock
humour francais
chill groove
historic classical performance
antilliaanse folklore
bohol indie
idaho hip hop
cimbalova muzika
theremin
deep surf music
luxembourgian metal
dutch idol pop
deep hardcore punk
kantele
turkish black metal
french contemporary classical
modern performance
brazilian post-rock
musica rondoniense
deep space rock
charred death
rock sul-mato-grossense
moorish traditional
organetto
punk tico
bury st edmunds indie
orkney and shetland folk
string orchestra
h8000
latin american baroque
tan co
south borneo indie
modern free jazz
italian rockabilly
classical bass
russian modern jazz
taiwan graduation song
brazilian surf rock
czech classical piano
tibetan folk pop
aghani lil-atfal
jazz composition
hip hop mauritanien
classical bassoon
karntner volksmusik
gayageum
gong
esperanto
new england experimental
glass
italian occult psychedelia
malaysian traditional
czech jazz
indie catracho
folclore extremeno
brazilian grindcore
italian baroque ensemble
extratone
indie tucumano
naturjodel
rock abc paulista
neo-trad doom metal
austrian choir
musica londrinense
rabm
polish noise rock
jazz caraibes
marsmuziek
musica caririense
lithuanian jazz
metal galego
russian screamo
somatik techno
icelandic choir
belfast metal
chaotic black metal
zohioliin duu
greek clarinet
gospel papiamento
classical oboe
vintage old-time
italian bass
proto-rap
jota aragonesa
liberian pop
vintage gospel
jazz boliviano
irish experimental
danish contemporary classical
german grindcore
skiffle
chakma pop
polish metalcore
taiwan experimental
hipco
deep active rock
turkmen hip hop
indian techno
egyptian traditional
folclore navarra
romanian contemporary classical
cimbalom
belfast indie
historic orchestral performance
contra dance
flashcore
czech swing
austrian classical piano
mexican electronic
latvian metal
folklore quebecois
french orchestra
lion city hardcore
zomi pop
orkiestra symfoniczna
landler
hard chime
metal cristao
magyar kabare
thai traditional
swazi hip hop
deep pop emo
cante alentejano
cryptic black metal
czech psychedelic
spanish black metal
italian industrial
band organ
afrikaans folk
moroccan traditional
rock paraense
thai psychedelic
ethnomusicology
ainu folk
northumbrian folk
deep orgcore
karelian folk
italian classical guitar
mexican black metal
portuguese post-rock
rap paraense
viola
nadaswaram
italian heavy metal
korean minyo
gypsy
classical piano trio
minnesang
classical tuba
rap burkinabe
baltic black metal
maldivian pop
czech hardcore
musica piemonteisa
indonesian black metal
musique traditionnelle congolaise
metal paraguayo
french rockabilly
portuguese hardcore
palm wine guitar
frevo
korean hardcore
experimental dubstep
baltic choir
musica roraimense
baoule
metal uruguayo
ethiopian traditional
post-rock latinoamericano
fife and drum
metal balear
classical guitar duo
troubadour
spoken word
portuguese early music
persian poetry
italian orchestra
song poem
boy soprano
korean contemporary classical
deep indie rock
appenzeller folk
indie nordeste argentino
deep neo-synthpop
kadongo kamu
irish death metal
metal catarinense
central american metal
turkish hardcore
animal singing
trombone ensemble
tatar folk
metal cearense
baltic classical piano
marathi balgeet
deep southern soul
balochi folk
pansori
dizi
brazilian classical piano
musique traditionnelle comorienne
inuit traditional
south african techno
lagu jambi
sarangi
euphonium
spanish contemporary classical
experimental poetry
rock nacional feminino
yiddish folk
accordion band
musica sinfonica
trecento
sacred harp
portuguese experimental
deep r&b
polish experimental
grunge argentina
akordeon
hard dance
metal baiano
harmonikka
black metal argentino
kamba pop
ghanaian traditional
taarab
nordnorsk ponk
industrial noise
hard stoner rock
venezuelan metal
traditional irish singing
luxembourgian electronic
malaysian post-rock
chinese black metal
santa fe indie
malian traditional
grunge brasileiro
kazakh traditional
vietnamese traditional
tanzanian traditional
classical guitar quartet
deep delta blues
ethereal gothic
maltese metal
estonian jazz
historical keyboard
jaw harp
irish hardcore
musica puntana
alphorn
alternative hardcore
deep latin jazz
classical contralto
bulgarian experimental
trouvere
classical piano duo
deep chill-out
punk ska
police band
czech contemporary classical
balkan classical piano
uyghur folk
swedish jazz orkester
jewish cantorial
musica urbana oaxaquena
school choir
ars subtilior
necrogrind
musique tchadienne
montana metal
irish modern jazz
cypriot metal
portuguese classical
australian choir
ghoststep
new zealand classical
iranian metal
puerto rican metal
indonesian electronic
canto a tenore
chilean black metal
lagu lampung
bells
south african dnb
jangle rock
huqin
romanian classical piano
peruvian death metal
brazilian doom metal
deep indie pop
art song
metis fiddle
classical horn
central asian folk
rock cristao fluminense
pygmy music
shantykoren
cosmic uplifting trance
hawaiian punk
deep motown
pibroch
russian oi
caribbean metal
school ensemble
twee indie pop
vanuatu music
horo
tahitian traditional
metal nortista
handbells
polish early music
musica ponta-grossense
schrammelmusik
indie tabasqueno
metal pernambucano
classical saxophone quartet
czech experimental
deep symphonic black metal
musica mogiana
opera chorus
albanian iso polyphony
drone psych
draaiorgel
sirmauri pop
twin cities indie
austrian contemporary classical
clarinet ensemble
baroque woodwind
indonesian indigenous traditional
burkinabe traditional
musica maringaense
harsh noise wall
chip hop
swiss contemporary classical
modern downshift
polish choir
baroque violin
lagu madura
deep smooth r&b
trad jazz catala
dark electro-industrial
kaba gaida
rock noise
wagnerian singing
indie emo rock
peruvian experimental
musique alsacienne
cantonese traditional
belgian classical piano
deep power-pop punk
deep deep tech house
rwandan traditional
kyrgyz traditional
burmese traditional
chinese opera
burundian traditional
baroque cello
cambodian traditional
vintage swoon
musique centrafricaine
faroese jazz
bruneian indie
korean classical piano
vintage rockabilly
rhythm and boogie
marci brijuzi
papuan traditional
macedonian metal
lao traditional
gay chorus
wind quintet
polish free jazz
deep breakcore
tanci
balikpapan indie
uzbek traditional
musica timor-leste
italian violin
wandelweiser
bothy ballad
metal piauiense
kenyan traditional
quatuor a cordes
italian choir
zampogna
ugandan traditional
yemeni traditional
tajik traditional
wind ensemble
hungarian choir
swiss classical piano
mazandarani folk
historic string quartet
italian mezzo-soprano
swazi traditional
trallalero
baroque brass
himene tarava
vintage western
classical string trio
cinematic dubstep
quartetto d'archi
yunnan traditional
classical piano quartet
string quintet
youth orchestra`.split('\n').map(g => ({ g }));
const EN_SIMILAR = Object.fromEntries(`abstract hip hop|underground rap;alternative hip hop;minnesota hip hop;outer hip hop;scottish hip hop;italian underground hip hop;seattle hip hop;welsh hip hop;chip hop;psychedelic hip hop;spiritual hip hop;maine hip hop
afro-funk|afrobeat;musica hondurena;latin afrobeat;old school highlife;ska revival;latin funk;haitian dance;punta;brazilian percussion;classic bhangra;deep funk;p funk
afro house|south african house;german house;munich electronic;swedish house;greek house;canadian house;dark disco;deep euro house;detroit house;deep soul house;jazz house;latvian electronic
afrobeat|afropop;world;classic afrobeat;latin afrobeat;funk;bboy;instrumental funk;ethio-jazz;brazilian percussion;afro-funk;new orleans funk;rare groove
afrobeats|nigerian pop;nigerian hip hop;afropop;azontobeats;naija old school;ghanaian pop;azonto;alte;bongo flava;panamanian pop;ugandan pop;igbo pop
alternative metal|nu metal;post-grunge;rap metal;industrial metal;rock;groove metal;metal;alternative rock;grunge;hard rock;funk metal;christian metal
alternative r&b|uk contemporary r&b;indie soul;escape room;israelite hip hop;trap queen;palestinian hip hop;maltese hip hop;rhode island rap;botswana pop;lgbtq+ hip hop;melbourne hip hop;afrofuturism
amapiano|sgija;barcadi;underground amapiano;south african deep house;south african soulful deep house;police band;clap and tap;bagpipe;marcha funebre;scottish smallpipe;bagpipe marching band;free folk
ambient|drone;nu age;sound art;fourth world;compositional ambient;intelligent dance music;warm drone;drift;deep ambient;abstract;nordic ambient;lowercase
ambient house|italo house;experimental house;ambient idm;pop ambient;intelligent dance music;ukrainian experimental;ambient techno;vaportrap;ambient trance;polish experimental electronic;irish experimental electronic;dutch experimental electronic
ambient techno|intelligent dance music;hypnotic techno;swedish electronic;dutch experimental electronic;swedish techno;dub techno;ambient house;glitch beats;irish experimental electronic;deep idm;vietnamese electronic;russian experimental electronic
american primitive|drone folk;pastoral;experimental guitar;ambient country;new weird america;polish modern jazz;santur;russian modern jazz;persian neo-traditional;string quintet;contemporary jazz;vintage italian soundtrack
new americana|stomp and holler;indie folk;alternative country;modern folk rock;folk;progressive bluegrass;nashville americana;roots rock;north carolina roots;southern americana;ectofolk;new england americana
art pop|experimental pop;indie pop;indie rock;chamber pop;indietronica;dream pop;noise pop;escape room;neo-synthpop;spectra;electronica;alternative dance
art rock|symphonic rock;progressive rock;classic rock;mellow gold;album rock;psychedelic rock;experimental;folk rock;glam rock;zolo;soft rock;singer-songwriter
avant-garde|contemporary classical;serialism;italian contemporary classical;21st century classical;american contemporary classical;acousmatic;german contemporary classical;xenharmonic;musique concrete;early modern classical;french contemporary classical;austrian contemporary classical
avant-garde jazz|free jazz;modern free jazz;free improvisation;jazz saxophone;jazz drums;contemporary post-bop;jazz;deep free jazz;jazz double bass;spiritual jazz;dutch jazz;jazz fusion
bachata|bachata dominicana;reggae do maranhao;muzica etno;cumbia salvadorena;african reggae;batidao romantico;bomba;cancoes infantis;combos nacionales;cumbia;cumbia colombiana regia;cumbia del sureste
balearic|nu disco;norwegian space disco;deep soul house;belgian electronic;ruta destroy;boston electronic;electronica chilena;norwegian house;japanese electronic;lo-fi house;irish electronic;experimental house
balkan beats|balkan brass;gypsy fusion;bahamian pop;musica quintanarroense;funktronica;indonesian underground hip hop;latin afrobeat;chinese reggae;bboy;acid jazz;afrofuturismo brasileiro;talentkonkurrence
baroque pop|chamber pop;indie rock;anadolu rock;michigan indie;musica mato-grossense;psychedelic folk rock;kermis;dark cabaret;modern rock;indie asturiana;jesus movement;springfield mo indie
bass music|miami bass;electro;microhouse;cologne electronic;lithuanian electronic;norwegian house;bleep techno;acid house;acid idm;afro house;arab electronic;balearic
bedroom pop|indie pop;pov: indie;pinoy indie;tamil indie;k-indie;arab alternative;nouvelle chanson francaise;singaporean pop;pinoy city pop;belo horizonte indie;chinese talent show;egyptian alternative
big beat|breakbeat;trip hop;electronica;rave;new beat;nu skool breaks;classic progressive house;grebo;christian dance;dubstep product;cuban electronic;future funk
big room|progressive electro house;dutch house;sky room;edm;electro house;pop dance;dutch edm;slap house;complextro;brostep;deep filthstep;future house
bitpop|chiptune;nintendocore;rhythm game;doujin;post-punk colombiano;coldwave;neo-synthpop;dark synthpop;minimal wave;electronic rock;solipsynthm;touhou
black metal|norwegian black metal;pagan black metal;swedish black metal;symphonic black metal;norwegian metal;black thrash;death metal;black 'n' roll;melodic black metal;metal;swedish metal;atmospheric black metal
blackgaze|atmospheric black metal;post-black metal;post-metal;autonomous black metal;emotional black metal;depressive black metal;cosmic black metal;avant-garde black metal;usbm;voidgaze;drone metal;cascadian black metal
bluegrass|bluegrass gospel;progressive bluegrass;banjo;instrumental bluegrass;mandolin;neo-traditional bluegrass;traditional bluegrass;appalachian folk;jamgrass;string band;modern old-time;folclore castilla y leon
blues|traditional blues;chicago blues;electric blues;acoustic blues;texas blues;memphis blues;blues rock;country blues;modern blues;delta blues;harmonica blues;southern rock
bolero|bolero mexicano;bolero cubano;ranchera;mexican rock-and-roll;musica tradicional cubana;cancion melodica;pop romantico;rebetiko;vintage swedish pop;shanty;canto popular uruguayo;musica yucateca
modern bollywood|filmi;desi pop;jordanian pop;turkmen pop;arab pop;sufi;armenian pop;louange;tunisian pop;musica amapaense;indian folk;karadeniz pop
boogaloo|latin jazz;salsa;afro-cuban percussion;salsa international;palm wine guitar;son jarocho;charanga;mambo;cuban funk;musica tradicional cubana;son cubano;puerto rican folk
boogie|post-disco soul;post-disco;popping;old school uk hip hop;deep disco;african reggae;atlanta bass;bahamian pop;balkan beats;bboy;bmore;bomba
boom bap|drumless hip hop;buffalo hip hop;upstate ny rap;underground boom bap;alternative hip hop;rock baiano;soul flow;spiritual hip hop;abstract hip hop;acoustic punk;afghan pop;african gospel
bossa nova|velha guarda;mpb;brazilian jazz;samba;violao;samba-jazz;tropicalia;choro;pagode;pop nacional antigas;irish folk;british folk
braindance|drill and bass;intelligent dance music;deep idm;acid idm;finnish electronic;outsider house;experimental techno;old school hard trance;tijuana electronic;estonian electronic;spanish electronic;minimal dnb
breakbeat|nu skool breaks;big beat;psybreaks;trip hop;bubble trance;belgian dance;bouncy house;electro trash;cuban electronic;rave;swedish ebm;jumpstyle
britpop|madchester;welsh rock;solo wave;grebo;alternative rock;rock cearense;varmland rock;dance rock;permanent wave;leeds indie;frankfurt indie;manchester indie
broken beat|indie jazz;acid jazz;african electronic;boston electronic;electro swing;french dub;post-disco soul;vogue;vapor house;bboy;electro dub;chill baile
brooklyn drill|new york drill;nyc rap;antilliaanse rap;argentine hip hop;german drill;dutch hip hop;korean underground rap;gospel drill;trap venezolano;trap antillais;gambian hip hop;drill dominicano
brostep|dubstep;filthstep;electronic trap;edm;electro house;gaming dubstep;complextro;riddim dubstep;deathstep;canadian electronic;glitch hop;big room
bubblegum bass|proto-hyperpop;hyperpop;indie liguria;salzburg indie;sulawesi indie;chip hop;bossbeat;cape town indie;vapor twitch;future bass;czsk electropop;uae indie
cabaret|vintage hollywood;vintage chanson;deep delta blues;torch song;music hall;vintage gospel;tango cancion;vaudeville;sean-nos singing;adult standards;american folk revival;british dance band
canterbury scene|progressive rock;italian progressive rock;symphonic rock;zeuhl;flute rock;rock progressif francais;zolo;experimental;jazz rock;synth prog;rock in opposition;cascadia psych
chamber folk|ambient folk;psalms;bandura;tibetan traditional;world devotional;rosary;kantele;tagalog worship;lds;himalayan folk;mongolian folk;faroese folk
chamber pop|melancholia;indie rock;stomp and holler;art pop;noise pop;baroque pop;countrygaze;lo-fi;indie pop;indietronica;singer-songwriter;alternative rock
champeta|hiplife;azonto;bajan soca;bhangra;bomba;boogie;coupe-decale;cubaton;cumbia paraguaya;cumbia pop;electro bailando;funana
chanson|ye ye;french pop;french rock;classic french pop;nouvelle chanson francaise;musica timor-leste;classic polish pop;musica de intervencao;czech singer-songwriter;sung poetry;variete francaise;folk
chicago house|classic house;deep house;acid house;soulful house;disco house;tribal house;techno;vocal house;deep funk house;garage house;guaracha;detroit house
chicha|cumbia amazonica;cumbia peruana;nu-cumbia;cumbia;musica oaxaquena;musica morelense;cumbia uruguaya;musica jalisciense;corridos cristianos;deep norteno;musica aguascalentense;banda guanajuatense
chillhop|lo-fi beats;jazz boom bap;lo-fi jazzhop;fake;steelpan;deep downtempo fusion;ambeat;abstract beats;ambient fusion;backing track;bass trip;beats
chillwave|indietronica;shimmer pop;indie dream pop;wonky;experimental pop;noise pop;art pop;electronica;neo-synthpop;dream pop;french synthpop;alternative dance
chiptune|bitpop;8-bit;sovietwave;minimal synth;gamecore;wrestling;vaporwave;synthwave brasileiro;demoscene;speedrun;downtempo fusion;neo-kraut
city pop|japanese r&b;japanese soul;ukrainian pop;belarusian pop;mongolian pop;musica catalana;british soul;p-pop;german pop;pinoy idol pop;guadalajara indie;electropop
classical|early modern classical;early music;late romantic era;neoclassicism;post-romantic era;baroque;classical era;german romanticism;russian romanticism;classical performance;early romantic era;impressionism
cloud rap|emo rap;dark trap;underground hip hop;drain;plugg;glitchcore;indie nica;kazakh indie;swazi pop;neo r&b;musica triste brasileira;r&b argentino
coldwave|french synthpop;french post-punk;minimal wave;baltic post-punk;puglia indie;ukrainian post-punk;chillwave;rebel blues;wrestling;grave wave;greek indie rock;otacore
corridos tumbados|sad sierreno;sierreno;corrido;musica mexicana;norteno;corridos belicos;cumbia uruguaya;plena uruguaya;banda;musica aguascalentense;musica sudcaliforniana;musica jalisciense
country|country road;contemporary country;country rock;classic country pop;modern country rock;country dawn;classic oklahoma country;outlaw country;nashville sound;classic iskelma;classic finnish pop;dansktop
crust punk|anarcho-punk;powerviolence;thrash core;swedish hardcore;d-beat;grindcore;hardcore punk;neo-crust;crossover thrash;uk82;japanese hardcore;california hardcore
cumbia|porro;classic colombian pop;musica popular colombiana;chicha;tropical;folclor colombiano;folclor afrocolombiano;combos nacionales;musica nayarita;musica costena;huapango;cumbia sonorense
cumbia villera|cuarteto;cumbia pop;cumbia paraguaya;kikuyu gospel;azontobeats;cumbia chilena;cumbia boliviana;cumbia cristiana;orquestas de galicia;togolese pop;duranguense;panamanian pop
dark ambient|ambient industrial;dronescape;swedish experimental;power electronics;martial industrial;neofolk;drone ambient;ritual ambient;new england experimental;canadian experimental;spanish experimental;iranian experimental
darksynth|synthwave;cyberpunk;russian witch house;modern darkwave;dark post-punk;bitpop;chill breakcore;chill-out trance;chiptune;danish electro;dark clubbing;dark electro-industrial
dark wave|gothic rock;neue deutsche todeskunst;ethereal wave;corrosion;neoclassical darkwave;ebm;industrial rock;futurepop;electro-industrial;industrial metal;aggrotech;rock gotico
deathcore|melodic metalcore;progressive deathcore;melodic deathcore;brutal deathcore;slamming deathcore;downtempo deathcore;symphonic deathcore;metalcore;blackened deathcore;djent;technical deathcore;technical melodic death metal
deep house|chicago house;soulful house;classic house;vocal house;disco house;float house;minimal tech house;house;future garage;deep funk house;tribal house;deep soul house
dembow|rap dominicano;trap dominicano;dancehall colombiano;funk carioca;dembow dominicano;funk rj;azonto;bajan soca;basshall;bounce;brega funk;cruise
desert blues|malian blues;tuareg guitar;mande pop;musique nigerienne;world;western saharan folk;griot;ngoni;afropop;wassoulou;west african jazz;musique touareg
detroit techno|techno;detroit house;minimal techno;acid house;electro;proto-techno;microhouse;nu electro;japanese techno;swedish electronic;float house;japanese house
disco|funk;quiet storm;post-disco;soul;classic soul;motown;p funk;philly soul;southern soul;soft rock;urban contemporary;new jack swing
doom metal|sludge metal;stoner metal;stoner rock;epic doom;drone metal;uk doom metal;post-metal;swedish doom metal;gaian doom;finnish doom metal;funeral doom;gothic metal
downtempo|electronica;trip hop;jazztronica;instrumental hip hop;nu jazz;indietronica;psychill;polish electronica;albanian alternative;taiwan electronic;french indietronica;finnish electro
dream pop|shoegaze;noise pop;nu gaze;art pop;modern dream pop;ethereal wave;slowcore;indie rock;alternative rock;experimental rock;melancholia;german prog
drift phonk|chill phonk;gym phonk;ukrainian phonk;phonk;anime phonk;singaporean electronic;indian edm;samurai trap;sinhala edm;pakistani electronic;nz electronic;psybass
drill|chicago drill;chicago rap;chicago bop;trap;indiana hip hop;christian trap;milwaukee hip hop;detroit trap;drill italiana;canadian hip hop;nashville hip hop;russian trap
drone|ambient;sound art;nu age;warm drone;drift;compositional ambient;lowercase;drone metal;intelligent dance music;minimalism;fourth world;glitch
drum and bass|neurofunk;jungle;liquid funk;jump up;dancefloor dnb;uk dnb;drumfunk;darkstep;atmospheric dnb;neurostep;ragga jungle;dutch dnb
dub|reggae;roots reggae;rocksteady;uk dub;old school dancehall;lovers rock;uk reggae;experimental dub;vintage reggae;bases de freestyle;deep ragga;dub poetry
dub techno|ambient dub techno;microhouse;intelligent dance music;minimal dub;minimal techno;outsider house;techno;ambient techno;float house;cologne electronic;georgian electronic;future ambient
dubstep|gaming dubstep;brostep;riddim dubstep;filthstep;tearout;deathstep;dariacore;electronic trap;russian trap metal;aggressive phonk;arab trap;australian dance
ebm|electro-industrial;futurepop;aggrotech;industrial metal;industrial;industrial rock;new beat;power noise;dark wave;old school ebm;swedish ebm;cyberpunk
electro house|progressive electro house;dutch house;edm;pop dance;brostep;complextro;big room;sky room;dutch edm;electronic trap;progressive house;melbourne bounce
electro swing|nu jazz;bboy;trival;uk garage;bmore;broken beat;uk funky;balkan beats;post-disco soul;dub brasileiro;popping;talentkonkurrence
electroclash|alternative dance;new rave;filter house;electrofox;dance-punk;neo-synthpop;danish electronic;canadian electronic;belgian edm;funktronica;deep eurodance;spanish electropop
electronica|trip hop;downtempo;intelligent dance music;future garage;wonky;alternative dance;indietronica;microhouse;big beat;new rave;minimal techno;neo-synthpop
electropop|indie poptimism;swedish electropop;indie electropop;chinese idol pop;alt z;metropopolis;chinese electropop;ukrainian pop;melodipop;hyperpop;p-pop;belarusian pop
emo|alternative emo;emo punk;midwest emo;post-hardcore;dreamo;screamo;pop punk;emocore;anthem emo;new england emo;rock goiano;neon pop punk
enka|modern enka;ryukoka;quarteto gospel;klapa;sda a cappella;louvor icm;adventista;swedish americana;vintage chinese pop;croatian folk;taiwan campus folk;corsican folk
ethereal wave|dark wave;neoclassical darkwave;gothic rock;medieval folk;corrosion;dream pop;neofolk;ethereal gothic;italian gothic;rune folk;thai post-rock;modern progressive rock
ethio-jazz|afrobeat;ethiopian pop;brass band;jamgrass;italian blues;souldies;indian fusion;psicodelia brasileira;psicodelia chilena;brass band pop;indian instrumental;eastern bloc groove
exotica|lounge;space age pop;easy listening;british jazz;jazz fusion;library music;russian jazz;sitar;balalaika;dutch jazz;gypsy;man's orchestra
experimental|experimental rock;industrial;no wave;post-punk;zolo;art rock;outsider;industrial rock;canterbury scene;british experimental;laboratorio;experimental guitar
experimental pop|art pop;hypnagogic pop;noise pop;chillwave;chamber psych;santa fe indie;estonian indie;rochester mn indie;dream pop;neo-psychedelic;multidisciplinary;armenian indie
fado|musica de intervencao;fado antigo;portuguese rock;fado instrumental;guitarra portuguesa;classic portuguese pop;fado de coimbra;portuguese pop;yorkshire folk;traditional british folk;min'yo;traditional english folk
fidget house|destroy techno;electro trash;house;bass house;experimental dubstep;vocal house;dubsteppe;deep groove house;australian house;bassline;disco house;mexican edm
filter house|electrofox;nu disco;electroclash;alternative dance;new rave;destroy techno;electronica;dance-punk;disco house;nantes indie;indietronica;danish electronic
flamenco|cante flamenco;flamenco guitar;nuevo flamenco;rumba;pop flamenco;rock andaluz;piano blues;soul jazz;bossa nova;vintage swedish pop;folklore argentino;soul
folk|singer-songwriter;folk rock;roots rock;country rock;ectofolk;mellow gold;heartland rock;new americana;alternative country;classic rock;lilith;american folk revival
footwork|ghettotech;future garage;classic dubstep;uk bass;vogue;wonky;grimewave;musica andorra;vapor house;cinematic dubstep;nz electronic;bristol electronic
fourth world|j-ambient;ambient;experimental ambient;drone;chinese soundtrack;minimalism;australian ambient;argentine ambient;french soundtrack;japanese soundtrack;latin soundtrack;neoclassical darkwave
freak folk|new weird america;free folk;new weird finland;duluth indie;rock in opposition;armenian folk;rock progressif francais;eau claire indie;throat singing;experimental;chant basque;microtonal
free improvisation|modern free jazz;avant-garde jazz;free jazz;tzadik;experimental guitar;electroacoustic improvisation;polish free jazz;deep free jazz;school ensemble;contemporary jazz;polish modern jazz;laboratorio
free jazz|avant-garde jazz;modern free jazz;free improvisation;jazz saxophone;contemporary post-bop;jazz drums;jazz;bebop;spiritual jazz;deep free jazz;jazz double bass;jazz fusion
funk|disco;quiet storm;soul;p funk;classic soul;post-disco;motown;urban contemporary;new jack swing;southern soul;philly soul;jazz funk
funk mandelao|funk viral;funk mtg;deboxe;funk rj;funk capixaba;funk 150 bpm;funk ostentacao;deep funk ostentacao;funk carioca;rave funk;brega funk;cruise
future funk|vaporwave;hardvapour;alternative dance;electrofox;new beat;big beat;funk mexicano;new rave;rock nica;minimal wave;early synthpop;covertrance
gabber|hardcore techno;happy hardcore;dark hardcore;speedcore;uptempo hardcore;industrial hardcore;classic hardstyle;doomcore;freeform hardcore;mashcore;aggrotech;dark electro-industrial
garage rock|garage rock revival;punk blues;modern rock;modern blues rock;garage pop;alternative rock;dance-punk;detroit rock;garage punk blues;rock;indie rock;noise pop
garage house|diva house;classic house;deep house;chicago house;soulful house;uk house;australian house;piano house;speed garage;funky house;brazilian bass;tribal house
garage punk|garage pop;portland punk;slash punk;modern power pop;swedish pop punk;deep orgcore;action rock;punk 'n' roll;nz punk;chicago hardcore;virginia punk;kentucky punk
glam rock|protopunk;rock;art rock;classic rock;album rock;classic hungarian rock;southern rock;glam punk;heartland rock;classic canadian rock;beatlesque;pinoy alternative rock
glitch|intelligent dance music;finnish experimental;lowercase;sound art;drone;mandible;glitch hop;brazilian experimental;abstract;polish experimental electronic;african experimental;chinese experimental
glitchcore|hyperpop;emoplugg;plugg;cloud rap;hyperpop italiano;greenlandic pop;maltese pop;emo trap en espanol;austrian pop;christian pop;metropopolis;vapor pop
gospel|gospel r&b;praise;contemporary gospel;dutch musical;german show tunes;rock of gibraltar;noel quebecois;southern gospel;classic ukrainian pop;tuna;musica sarda;classic czech pop
gqom|brazilian house;afrikaans gqom;dubsteppe;brazilian edm;groove room;hamburg electronic;workout product;deep house;uk house;australian house;afro house;munich electronic
grime|uk hip hop;birmingham grime;instrumental grime;afroswing;birmingham hip hop;london rap;croatian hip hop;gospel rap;russian grime;psychokore;deep german hip hop;australian underground hip hop
grunge|underground grunge;alternative rock;alternative metal;post-grunge;post-hardcore;nu metal;rock;pop rock;supergroup;permanent wave;noise rock;emo punk
gypsy jazz|jazz guitar;barrelhouse piano;boogie-woogie;concertina;dixieland;dombra;french jazz;hot jazz;jazz clarinet;modern swing;new orleans jazz;ragtime
hard techno|hard industrial techno;german dark minimal techno;portuguese techno;raw techno;acid techno;dark techno;croatian electronic;re:techno;dark minimal techno;minimal dub;acid trance;australian techno
hardcore punk|punk;anarcho-punk;crossover thrash;california hardcore;dc hardcore;uk82;crust punk;hardcore;boston hardcore;oi;straight edge;nyhc
hardstyle|euphoric hardstyle;rawstyle;xtra raw;classic hardstyle;alt-idol;dancefloor dnb;dark hardcore;deathstep;denpa-kei;freeform hardcore;frenchcore;future rock
highlife|classic afrobeat;igbo pop;hiplife;cumbia funk;brazilian percussion;edo old school;new orleans funk;benga;ohangla;afrobeat;musica hondurena;gwoka
hip hop|gangster rap;rap;pop rap;hardcore hip hop;conscious hip hop;southern hip hop;east coast hip hop;west coast rap;trap;queens hip hop;alternative hip hop;golden age hip hop
house|deep groove house;uk dance;tech house;pop dance;deep disco house;edm;uk house;electro house;progressive house;bass house;deep house;minimal techno
huapango|musica potosina;chilena;cumbia sonorense;musica costena;folclor afrocolombiano;musica istmena;porro;cumbia;kamba pop;orquesta tropical;musica duranguense;ska revival
hyperpop|glitchcore;proto-hyperpop;escape room;bubblegum bass;pink noise;japanese hyperpop;chinese idol pop;chinese electropop;electropop;nightcore;hyperpop italiano;austrian pop
hypnagogic pop|experimental pop;vaporwave;indie tabasqueno;mecha;japanese dream pop;baltimore indie;shimmer psych;progressive jazz fusion;bristol indie;shanghai indie;rochester mn indie;japanese celtic
deep idm|intelligent dance music;drill and bass;ambient idm;abstract;acid idm;braindance;indie electronica;breakcore;irish experimental electronic;russian experimental electronic;glitch beats;japanese idm
illbient|dub metal;experimental electronic;glitch pop;intelligent dance music;deep idm;irish experimental electronic;wonky;fluxwork;japanese idm;vaporwave;russian experimental electronic;uk experimental electronic
indie folk|new americana;stomp and holler;british singer-songwriter;indie anthem-folk;stomp and flutter;acoustic pop;chamber pop;modern indie folk;modern folk rock;swedish singer-songwriter;taiwanese indigenous music;icelandic folk
indie pop|art pop;pov: indie;bedroom pop;indie rock;chamber pop;countrygaze;deep acoustic pop;hindi worship;indie quebecois;chinese indie;irish pop;taiwan singer-songwriter
indie rock|chamber pop;art pop;alternative rock;noise pop;modern rock;indietronica;lo-fi;canadian indie;brooklyn indie;alternative dance;stomp and holler;indie pop
indietronica|shimmer pop;chillwave;neo-synthpop;metropopolis;alternative dance;indie rock;electronica;new rave;modern rock;art pop;dance-punk;chamber pop
industrial|industrial rock;electro-industrial;experimental;ebm;industrial metal;british industrial;experimental rock;new beat;post-punk;no wave;power electronics;power noise
industrial metal|industrial rock;electro-industrial;nu metal;ebm;industrial;alternative metal;aggrotech;groove metal;rap metal;futurepop;neue deutsche harte;dark wave
industrial rock|industrial;industrial metal;electro-industrial;ebm;dark wave;experimental;cyberpunk;new beat;nu metal;post-punk;power noise;experimental rock
industrial techno|minimal dub;chilean techno;modular techno;colombian electronic;acid techno;finnish techno;acid trance;glitter trance;experimental techno;acid idm;australian techno;belarusian electronic
italo disco|new italo disco;hi-nrg;deep italo disco;spacesynth;deep freestyle;freestyle;talentkonkurrence;spanish electropop;funktronica;deep eurodance;diva house;balkan beats
j-pop|classic j-pop;j-rock;okinawan pop;japanese singer-songwriter;anime;j-poprock;j-acoustic;japanese teen pop;j-idol;anime rock;candy pop;kansai indie
j-rock|japanese alternative rock;j-pop;japanese punk rock;j-poprock;anime rock;anime;j-punk;japanese post-hardcore;japanese indie rock;japanese garage rock;british indie rock;canadian rock
jangle pop|power pop;underground power pop;paisley underground;beatlesque;gbvfi;album rock;knoxville indie;classic hungarian rock;indonesian blues;new wave;alternative roots rock;celtic rock
jazz|bebop;contemporary post-bop;hard bop;cool jazz;jazz saxophone;jazz piano;jazz trumpet;jazz fusion;vocal jazz;contemporary jazz;jazz funk;swing
jazz funk|soul jazz;jazz fusion;funk;hammond organ;jazz organ;jazz;p funk;smooth jazz;classic soul;contemporary post-bop;instrumental soul;jazz piano
jazz fusion|electric bass;contemporary post-bop;jazz;jazz funk;jazz drums;jazz piano;progressive rock;ecm-style jazz;jazz guitar;british jazz;bebop;contemporary jazz
jazz rap|east coast hip hop;alternative hip hop;scratch;outer hip hop;polish old school hip hop;rap nacional antigo;bayerischer rap;synth funk;rap underground colombiano;turntablism;deep east coast hip hop;comedy rap
jazz rock|canterbury scene;progressive rock;symphonic rock;prog quebec;sacred steel;acid rock;zeuhl;rock in opposition;experimental;art rock;flute rock;acoustic rock
lo-fi jazzhop|lo-fi latino;study beats;lo-fi brasileiro;japanese chillhop;chillhop;focus beats;lo-fi vgm;lo-fi beats;ambeat;ambient fusion;backing track;beats
jungle|drum and bass;ragga jungle;jump up;neurofunk;drumfunk;liquid funk;atmospheric dnb;hardcore techno;stateside dnb;uk dnb;hardcore breaks;tekno
k-indie|korean pop;korean indie rock;korean indie folk;korean electropop;korean singer-songwriter;k-rock;korean dream pop;korean city pop;bedroom pop;pinoy indie;swiss singer-songwriter;arab alternative
k-pop|k-pop boy group;k-pop girl group;korean pop;korean r&b;japanese teen pop;pop;post-teen pop;classic k-pop;japanese dance pop;mexican pop;talent show;melodipop
krautrock|german prog;berlin school;tennessee experimental;taiwan experimental;rock progresivo mexicano;british experimental;raga rock;experimental jazz;african experimental;rock keyboard;rock progressif francais;korean experimental
kuduro|afro house angolano;batida;guaracha;ghettotech;hungarian edm;brazilian edm;2-step;afrikaans gqom;afro house;arab electronic;australian house;bass house
latin alternative|rock en espanol;latin rock;mexican rock;ska argentino;argentine rock;latin pop;mexican indie;ska mexicano;indie rock mexicano;mexican pop;latin arena pop;latin ska
latin jazz|jazz cubano;salsa international;mambo;salsa;musica tradicional cubana;boogaloo;jazz puertorriqueno;afro-cuban percussion;cha-cha-cha;new orleans blues;cuban rumba;louisiana blues
liquid funk|uk dnb;deep dnb;drum and bass;stateside dnb;jazzy dnb;russian dnb;neurofunk;deep liquid bass;austrian dnb;brazilian dnb;dutch dnb;jungle
lo-fi house|float house;dusseldorf electronic;japanese electronic;norwegian space disco;outsider house;electronica chilena;japanese house;eletronica underground brasileira;experimental house;boston electronic;lithuanian electronic;norwegian house
lo-fi|gbvfi;noise pop;indie rock;alternative rock;elephant 6;chamber pop;alternative pop;slowcore;experimental rock;anti-folk;noise rock;dunedin sound
lovers rock|roots reggae;old school dancehall;reggae;deep ragga;rocksteady;modern reggae;riddim;dub;dancehall;uk reggae;traditional reggae;finnish reggae
mariachi|ranchera;modern old-time;folclore castilla y leon;bluegrass;afrikaans folk;autoharp;otroske pesmice;classic greek pop;bluegrass gospel;muzica maramureseana;north carolina roots;progressive bluegrass
math rock|instrumental math rock;british math rock;instrumental rock;post-hardcore;louisville underground;math pop;noise rock;japanese post-rock;experimental rock;slowcore;emo punk;japanese math rock
mathcore|chaotic hardcore;sasscore;mathgrind;nintendocore;metal baiano;american metalcore;singaporean metal;mexican death metal;brazilian death metal;peruvian death metal;death metal;powerviolence
merengue|merengue tipico;tropical;salsa;musica tradicional dominicana;gaita zuliana;cumbia funk;ohangla;kamba pop;classic punjabi pop;benga;musica duranguense;musica morelense
metal|speed metal;thrash metal;old school thrash;groove metal;death metal;hard rock;power metal;black metal;alternative metal;glam metal;us power metal;swedish metal
metalcore|melodic metalcore;american metalcore;trancecore;deathcore;australian metalcore;christian metalcore;screamo;post-post-hardcore;progressive metalcore;australian post-hardcore;german metalcore;uk metalcore
microhouse|float house;minimal techno;dub techno;techno;electronica;future garage;intelligent dance music;deep disco house;minimal tech house;wonky;cologne electronic;outsider house
midwest emo|emo punk;diy emo;5th wave emo;new england emo;emo;alternative emo;skramz;el paso indie;cleveland indie;bury st edmunds indie;austin rock;danish alternative rock
minimal techno|techno;microhouse;german techno;minimal tech house;deep disco house;detroit techno;german house;deep minimal techno;electronica;melodic techno;minimal dub;float house
minimal wave|grave wave;dark post-punk;proto-techno;minimal synth;belgian new wave;coldwave;french post-punk;neue deutsche welle;italian new wave;finnish electro;c64;solipsynthm
minimalism|post-minimalism;american contemporary classical;compositional ambient;contemporary classical;acousmatic;drone;21st century classical;avant-garde;fourth world;icelandic classical;japanese classical performance;spanish contemporary classical
british modern classical|victorian britain;early modern classical;anglican liturgy;post-romantic era;finnish classical;light music;nordic contemporary classical;polish contemporary classical;baltic classical;swedish contemporary classical;21st century classical;canadian classical
moombahton|basshall;dakke dak;melbourne bounce international;uk dance;pop house;german dance;future house;belgian edm;melbourne bounce;slap house;gym phonk;klubowe
mpb|samba;bossa nova;tropicalia;velha guarda;pop nacional antigas;brazilian rock;rock nacional brasileiro;pagode;axe;nova mpb;musica valenciana;manguebeat
musique concrete|acousmatic;electroacoustic composition;avant-garde;dutch experimental;french contemporary classical;austrian contemporary classical;british electroacoustic;modern performance;american 21st century classical;caucasian classical;chinese classical;czech contemporary classical
neo soul|urban contemporary;r&b;contemporary r&b;soul;british soul;hip pop;quiet storm;pop soul;cantautor;anti-folk;smooth soul;folk rock italiano
neo-classical|compositional ambient;post-minimalism;japanese classical piano;belgian contemporary classical;nordic classical piano;japanese piano;focus;italian classical piano;pet calming;american classical piano;american contemporary classical;australian classical piano
neoperreo|rap latina;japanese drill;polish viral pop;bulgarian hip hop;russian pixel;russian viral rap;reggaeton mexicano;romanian trap;miami hip hop;czsk viral pop;turkish trap;sichuanese hip hop
new age|new age piano;healing;celtic;j-ambient;taiwan instrumental;comfy synth;theremin;neoclassical darkwave;fourth world;anime score;japanese soundtrack;pastoral
new jack swing|contemporary r&b;urban contemporary;quiet storm;post-disco;minneapolis sound;r&b;funk;boy band;disco;soul;classic soul;p funk
new wave|new romantic;new wave pop;synthpop;dance rock;permanent wave;post-punk;sophisti-pop;uk post-punk;soft rock;album rock;rock;zolo
no wave|post-punk;experimental rock;experimental;industrial;uk post-punk;dance rock;punk;olympia wa indie;experimental indie rock;rock drums;zolo;louisville underground
noise rock|noise punk;post-hardcore;experimental rock;noise pop;uk noise rock;sasscore;math rock;post-punk;lo-fi;art punk;experimental;grunge
norteno|musica mexicana;banda;sierreno;corrido;sad sierreno;corridos alternativos;grupera;corridos tumbados;corridos clasicos;classic sierreno;gruperas inmortales;tejano
nu gaze|shoegaze;indie shoegaze;dreamgaze;american shoegaze;dream pop;grungegaze;noise pop;dreamo;modern dream pop;nordic shoegaze;shoegaze chileno;countrygaze
nu jazz|electro jazz;jazztronica;trip hop;electro swing;bboy;funky breaks;downtempo;ambeat;deep italo disco;hip-hop experimental;japanese dub;latintronica
nu metal|alternative metal;post-grunge;rap metal;industrial metal;groove metal;funk metal;rap rock;rock;alternative rock;grunge;hard rock;melodic metalcore
nu skool breaks|breakbeat;classic progressive house;psybreaks;big beat;belgian dance;danish electronic;german techno;experimental dubstep;bubble trance;cuban electronic;filter house;canadian electronic
nu disco|filter house;balearic;electrofox;alternative dance;indie soul;funktronica;indietronica;deep house;funky breaks;dubsteppe;ruta destroy;danish electronic
nueva cancion|trova;musica andina chilena;cantautor;musica andina;chilean rock;nueva trova chilena;folclore tucumano;musica yucateca;french folk;bard;canto popular uruguayo;deep brazilian pop
nuevo flamenco|flamenco guitar;flamenco;cante flamenco;pop flamenco;folclore jujeno;folklore nuevo argentino;musica popular uruguaya;mantra;musica mogiana;folclore santiagueno;musique peule;musica mapuche
opera|classical soprano;classical mezzo-soprano;classical tenor;classical baritone;classical bass;italian soprano;italian opera;italian romanticism;german opera;wagnerian singing;austrian choir;italian mezzo-soprano
p funk|funk;post-disco;disco;soul;quiet storm;classic soul;jazz funk;motown;southern soul;new jack swing;latin funk;afro-funk
philly soul|quiet storm;motown;classic soul;disco;soul;funk;post-disco;southern soul;deep northern soul;classic french pop;classic uk pop;austropop
phonk|drift phonk;electro dub;french dub;musica eletronica brasileira;chill baile;latintronica;pakistani electronic;new french touch;african electronic;belgian electronic;urban kiz;musica andorra
pop punk|neon pop punk;anthem emo;pop emo;pixie;easycore;alternative emo;screamo;emo;canadian pop punk;post-hardcore;metalcore;socal pop punk
post-hardcore|emo;emo punk;screamo;noise rock;math rock;emocore;grunge;dc hardcore;post-punk;pop punk;experimental rock;neon pop punk
post-punk|uk post-punk;no wave;art punk;alternative rock;experimental rock;experimental;punk;new wave;industrial;noise rock;madchester;post-hardcore
uk post-punk revival|crank wave;sonora indie;german post-punk;rock catarinense;frankfurt indie;madchester;swedish post-punk;japanese post-punk;american post-punk;synth punk;rock cearense;grunge brasileiro
post-rock|instrumental post-rock;british post-rock;american post-rock;canadian post-rock;nordic post-rock;post-metal;compositional ambient;atmospheric post-metal;german post-rock;double drumming;experimental rock;italian occult psychedelia
power electronics|noise;death industrial;harsh noise wall;martial industrial;ambient industrial;swedish experimental;industrial noise;neofolk;industrial;dark ambient;japanoise;depressive black metal
powerviolence|crust punk;grindcore;thrash core;american grindcore;noisecore;modern hardcore;goregrind;california hardcore;anarcho-punk;florida death metal;singaporean metal;mexican death metal
progressive house|trance;progressive trance;uplifting trance;edm;progressive electro house;dutch house;pop dance;dutch trance;electro house;house;progressive trance house;deep uplifting trance
progressive rock|symphonic rock;canterbury scene;neo-progressive;art rock;italian progressive rock;progressive metal;crossover prog;flute rock;album rock;classic rock;deep progressive rock;blues rock
protopunk|glam rock;psychedelic rock;classic garage rock;freakbeat;british invasion;detroit rock;experimental rock;british blues;early us punk;pub rock;experimental;psychedelic blues-rock
psychedelic rock|classic rock;classic garage rock;folk rock;country rock;blues rock;protopunk;acid rock;freakbeat;proto-metal;album rock;art rock;mellow gold
punk|hardcore punk;skate punk;ska;ska punk;post-punk;alternative rock;early us punk;crossover thrash;oi;socal pop punk;finnish punk;post-hardcore
qawwali|sufi;classic pakistani pop;pakistani folk;classic moroccan pop;french rock-and-roll;canadian rockabilly;blues rock;gujarati garba;northern soul;rajasthani folk;motown;swamp rock
quiet storm|funk;disco;motown;soul;philly soul;classic soul;post-disco;urban contemporary;new jack swing;southern soul;p funk;contemporary r&b
r&b|urban contemporary;contemporary r&b;hip pop;new jack swing;neo soul;dance pop;southern hip hop;rap;girl group;trap;pop rap;pop r&b
rage rap|plugg;pluggnb;chicago bop;ua trap;russian plugg;german trap;slovak trap;drill;melodic rap;chicago drill;indonesian trap;dark trap
rai|deep rai;moroccan pop;rif;rai algerien;himachali pop;tallava;kabyle;kabyle moderne;nagpuri pop;carnaval limburg;axe;carimbo
rap|trap;pop rap;southern hip hop;hip hop;atl hip hop;gangster rap;dirty south rap;melodic rap;r&b;east coast hip hop;conscious hip hop;underground hip hop
reggae|roots reggae;dub;rocksteady;lovers rock;old school dancehall;modern reggae;uk dub;early reggae;reggae fusion;dancehall;deep ragga;vintage reggae
reggaeton|urbano latino;trap latino;latin hip hop;reggaeton colombiano;reggaeton flow;latin pop;colombian pop;funk pop;reggaeton chileno;pop reggaeton;mambo chileno;electro bailando
regional mexicano femenil|corridos belicos;musica queretana;sertanejo tradicional;musica mexicana;adoracion pentecostal;afropop;arpa grande;banda;banda carnavalera;banda guanajuatense;brega;chamame brasilero
riddim|dancehall;modern reggae;lovers rock;jamaican dancehall;dancehall queen;old school dancehall;roots reggae;deep ragga;reggae fusion;tanzanian hip hop;jamaican hip hop;hipco
riot grrrl|queercore;indie punk;bubblegrunge;olympia wa indie;canadian garage rock;neo-proto;garage rock;cowpunk;alternative pop;rock campineiro;northern irish punk;black punk
rock en espanol|latin alternative;latin rock;mexican rock;latin pop;argentine rock;ska argentino;mexican pop;latin arena pop;rock urbano mexicano;reggae uruguayo;argentine reggae;ska mexicano
rock nacional|argentine rock;blues latinoamericano;post-punk argentina;folklore argentino;argentine indie;italian folk;french movie tunes;autoharp;classic latvian pop;musica sarda;musica menorquina;psicodelia chilena
rocksteady|early reggae;reggae;roots reggae;dub;jamaican ska;old school dancehall;lovers rock;ska revival;ska;vintage reggae;bachchon ke geet;bases de freestyle
roots reggae|reggae;lovers rock;old school dancehall;dub;rocksteady;modern reggae;deep ragga;uk dub;dancehall;riddim;uk reggae;early reggae
salsa|salsa international;salsa puertorriquena;tropical;latin jazz;modern salsa;salsa colombiana;boogaloo;merengue;mambo;bomba y plena;chamame;musique mandingue
samba|velha guarda;mpb;bossa nova;pagode;samba moderno;samba-enredo;partido alto;tropicalia;roda de samba;choro;axe;samba paulista
samba-jazz|brazilian jazz;bossa nova;jazz brass;violao;cool jazz;jazz quartet;jazz violin;polca paraguaya;scottish jazz;swedish jazz orkester;choro;jazz
samba-rock|brazilian soul;samba;tropicalia;musica pernambucana;psicodelia brasileira;tinku;garifuna folk;tamazight;zydeco;funk;manguebeat;yemeni pop
screamo|neon pop punk;post-hardcore;pop punk;emo;skramz;metalcore;progressive post-hardcore;pop emo;melodic metalcore;nintendocore;post-post-hardcore;uk post-hardcore
shibuya-kei|japanese jazztronica;venezuelan indie;antiviral pop;indie campechano;guadalajara indie;mexican indie;belgian new wave;seinen;bossbeat;synthpop;sophisti-pop;proto-hyperpop
shoegaze|nu gaze;dream pop;noise pop;indie shoegaze;dreamgaze;american shoegaze;spacegrunge;alternative rock;grungegaze;slowcore;indie rock;modern dream pop
sierreno|corrido;norteno;corridos tumbados;musica mexicana;sad sierreno;banda;corridos alternativos;musica sinaloense;tierra caliente;corridos adictivos;tololoche;corridos clasicos
ska|ska punk;ska revival;skate punk;punk;modern ska punk;euroska;traditional ska;crack rock steady;rocksteady;melodic hardcore;ska mexicano;australian ska
slowcore|melancholia;dream pop;lo-fi;shoegaze;math rock;louisville underground;post-hardcore;theme;modern psychedelic folk;christelijk;arab experimental;cello
sludge metal|post-doom metal;black sludge;drone metal;stoner metal;post-metal;doom metal;stoner rock;louisiana metal;atmospheric post-metal;chaotic hardcore;atmospheric sludge;skramz
smooth soul|neo soul;neo soul-jazz;pacific islands pop;afro soul;contemporary r&b;rap portuense;gospel reggae;hong kong hip hop;sudanese pop;urban contemporary;new jack smooth;new jack swing
soft rock|mellow gold;classic rock;heartland rock;album rock;yacht rock;rock;folk rock;singer-songwriter;country rock;new wave pop;hard rock;new romantic
son cubano|musica tradicional cubana;son cubano clasico;bolero cubano;charanga;boogaloo;son jarocho;afro-cuban percussion;afro-cuban traditional;blues;bomba y plena;burkinabe traditional;capoeira
son jarocho|folklore veracruzano;mexican son;boogaloo;puerto rican folk;musica jibara;chamame;charanga;classic peruvian pop;marathi balgeet;classic venezuelan pop;salsa international;musique mandingue
soukous|zilizopendwa;rumba congolaise;ndombolo;benga;tamazight;balochi pop;balochi folk;forro tradicional;sungura;classic punjabi pop;zydeco;musica morelense
soul|funk;quiet storm;classic soul;disco;motown;southern soul;p funk;post-disco;philly soul;soul blues;vocal jazz;urban contemporary
sound collage|experimental;outsider;classic tunisian pop;inuit traditional;freak folk;japanese experimental;taiwan experimental;rock progressif francais;rock in opposition;experimental big band;vintage french electronic;saxophone trio
soundtrack|orchestral soundtrack;british soundtrack;canadian soundtrack;nordic soundtrack;german soundtrack;oceania soundtrack;nu age;deep soundtrack;ambient guitar;ambient synth;nordic ambient;ambient
space rock|deep space rock;psychedelic space rock;stoner rock;retro metal;psychedelic doom;instrumental stoner rock;stoner metal;swedish psychedelic rock;dutch stoner rock;neo-psychedelic;german stoner rock;double drumming
spiritual jazz|jazz fusion;sitar;british jazz;jazz orchestra;free jazz;avant-garde jazz;experimental big band;exotica;hindustani classical;outsider;dutch jazz;jazz chileno
stoner rock|stoner metal;retro metal;psychedelic doom;sludge metal;doom metal;space rock;palm desert scene;drone metal;swedish stoner rock;instrumental stoner rock;post-metal;alternative roots rock
sunshine pop|bubblegum pop;folk rock;merseybeat;psychedelic rock;classic garage rock;country rock;czech country;hare krishna;chicago soul;singer-songwriter;irish rebel song;czech folk
synthpop|new romantic;new wave pop;new wave;dance rock;sophisti-pop;permanent wave;soft rock;zolo;deep new wave;hi-nrg;solo wave;belgian new wave
synthwave|spacewave;darksynth;cyberpunk;nightrun;popwave;chillsynth;synthwave brasileiro;sovietwave;chill-out trance;danish electro;dark synthpop;c64
tango|vintage tango;orquesta tipica;nuevo tango;bandoneon;neotango;yiddish folk;swing;harlem renaissance;vaudeville;jazz;tin pan alley;swedish jazz orkester
tech house|uk tech house;bass house;house;italian tech house;uk dance;funky tech house;brazilian tech house;jackin' house;funky house;dutch tech house;mexican tech house;french tech house
techno|minimal techno;detroit techno;minimal dub;microhouse;acid house;float house;deep minimal techno;intelligent dance music;dub techno;detroit house;japanese techno;electro
trance|uplifting trance;progressive house;progressive trance;dutch trance;progressive uplifting trance;deep uplifting trance;russian trance;bubble trance;german techno;german trance;tech trance;vocal trance
trap|southern hip hop;rap;atl hip hop;pop rap;dirty south rap;melodic rap;hip hop;gangster rap;tennessee hip hop;crunk;chicago rap;drill
trip hop|electronica;downtempo;jazztronica;nu jazz;big beat;intelligent dance music;indietronica;breakbeat;finnish electro;art pop;bossbeat;italo house
tropical house|chill house;scandipop;korean hyperpop;junior songfestival;russian emo rap;saxophone house;aussietronica;australian electropop;russian dance;japanese trap;stutter house;kazakh pop
tropicalia|mpb;psicodelia brasileira;bossa nova;samba;jovem guarda;folklore chileno;samba-rock;memphis soul;musica popular uruguaya;musica lombarda;classic soul;deep southern soul
trova|nueva cancion;trova mexicana;cantautor;cuban alternative;musica yucateca;deep brazilian pop;japanese vocal jazz;british folk;bard;musica de intervencao;jazz pop;folclore tucumano
turkish psych|anadolu rock;classic turkish pop;turkish rock;country rock;roots rock;musica mato-grossense;svensk progg;maghreb;folk rock;nederpop;singer-songwriter;souldies
twee pop|tape club;indie fuzzpop;c86;twee indie pop;dallas indie;ontario indie;christchurch indie;dc indie;indiana indie;cardiff indie;austindie;celtic rock
uk bass|footwork;future garage;classic dubstep;grimewave;cinematic dubstep;somatik techno;musica andorra;slovak electronic;slovenian electronic;irish electronic;czech electronic;dusseldorf electronic
uk drill|uk hip hop;new york drill;dutch drill;afro drill;melodic drill;scottish drill;gospel drill;brooklyn drill;german viral rap;antilliaanse rap;aussie drill;rap maromba
uk garage|speed garage;2-step;uk funky;bmore;trival;britcore;electro swing;batida;bboy;old school uk hip hop;funky breaks;diva house
vaporwave|mallsoft;hardvapour;utopian virtual;future funk;slushwave;vaportrap;broken transmission;dreampunk;hypnagogic pop;turkish post-punk;neo-kraut;downtempo fusion
video game music|indie game soundtrack;orchestral soundtrack;polish ambient;dreampunk;space ambient;experimental synth;scorecore;australian experimental;indian ambient;comfy synth;dark jazz;new isolationism
vocal jazz|adult standards;lounge;torch song;jazz blues;jazz;contemporary vocal jazz;swing;soul;jazz pop;cool jazz;harlem renaissance;easy listening
witch house|russian witch house;wave;grave wave;hardwave;cyberpunk;abstract idm;anime game;belfast indie;belgian indie rock;belgian post-rock;chill breakcore;chill dream pop
yacht rock|deep soft rock;soft rock;mellow gold;classic rock;album rock;classic nz pop;heartland rock;singer-songwriter;native american contemporary;classic russian rock;folk rock;classic uk pop
zeuhl|canterbury scene;rock progressif francais;japanese prog;rock in opposition;japanese psychedelic;cascadia psych;italian progressive rock;experimental;scottish smallpipe;raga rock;flute rock;synth prog`.split('\n').map(l => { const [g, n] = l.split('|'); return [g, n.split(';')]; }));
const enKey = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const enSlug = g => String(g).toLowerCase().replace(/[^a-z0-9]/g, '');
const EN_BY = new Map(EN.map(e => [enKey(e.g), e]));
const EN_ALIAS = { lofi: 'lo-fi beats', jazzhop: 'lo-fi jazzhop', americana: 'new americana', balkanbeat: 'balkan beats', bollywood: 'modern bollywood', corridos: 'corridos tumbados', garage: 'garage rock', psychedelic: 'psychedelic rock', sludge: 'sludge metal', modernclassical: 'british modern classical', minimal: 'minimal techno', regionalmexicano: 'regional mexicano femenil', idm: 'deep idm', rage: 'rage rap', postpunkrevival: 'uk post-punk revival' };
function enFind(term) { const k = enKey(term); return (EN_ALIAS[k] && EN_BY.get(enKey(EN_ALIAS[k]))) || EN_BY.get(k) || null; }
function enNear(term, k = 8, skip = 0) { const e = enFind(term); return e && EN_SIMILAR[e.g] ? EN_SIMILAR[e.g].slice(skip, skip + k) : []; }
let enMulti = null;
function enMatchText(text) {
  if (!enMulti) enMulti = EN.filter(e => e.g.includes(' ') && e.g.length >= 6).map(e => ({ g: e.g, n: norm(e.g) })).sort((a, b) => b.n.length - a.n.length);
  const out = []; let rest = text;
  for (const e of enMulti) { if (rest.includes(e.n)) { out.push(e.g); rest = rest.replace(e.n, ' '); if (out.length >= 3) break; } }
  return out;
}
