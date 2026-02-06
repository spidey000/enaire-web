# 1. Introducción

La cartografía y la topografía son las ciencias que estudian la representación total o parcial de la superficie terrestre sobre un mapa o un plano
Se suelen denominar cartas a aquellos mapas o planos que se diseñan para atender una serie de necesidades funcionales establecidas por los propios usuarios
De este modo las cartas aeronáuticas son aquéllas que sirven al desarrollo de las diferentes fases de un vuelo cumpliendo con los requerimientos operativos de la  aérea

En la primera parte de este manual se estudiará el proceso de elaboración de los mapas y los planos Para ello inicialmente se abordará el estudio de las principales características físicas de la superficie terrestre
Posteriormente se analizarán los fundamentos de la reproducción cartográfica y topográfica realizando un breve repaso de los sistemas de representación más utilizados en la confección de cartas aeronáuticas
Se ofrecerá una visión general de las cartas destinadas a la  aérea sus funcionalidades principales características y todo lo referente a la normativa aeronáutica que rige su producción publicación y distribución

# 2. Conceptos básicos de Geodesia

El trazado de cualquier tipo de mapa o plano requiere el estudio y conocimiento previos de la superficie concreta que se quiere representar así como un sistema que permita la localización de los puntos que la constituyen
La Geodesia es una ciencia que estudia la forma y dimensiones de la Tierra su campo de gravedad sus variaciones temporales y la manera de representarla en un plano
Su objetivo es el estudio y determinación de la forma y dimensiones de la Tierra de su campo de gravedad y sus variaciones temporales así como construir los mapas correspondientes
Se trata de una ciencia fundamentada en la física y en las matemáticas cuyos resultados constituyen la base geométrica para otras ramas del conocimiento geográfico como son la topografía la cartografía la fotogrametría la  así como ingenierías de todo tipo o para fines militares y programas espaciales

## 2.1. Forma y dimensiones de la tierra

La Tierra está ligeramente achatada en los polos y ensanchada por el Ecuador como resultado de la combinación de las fuerzas centrífugas y gravitatorias que actúan sobre ella A esta forma (que es la real) es lo que se llama geoide Por ello para su estudio se usan superficies geométricas de referencia terrestre como el geoide y el elipsoide de revolución

El geoide se define como la superficie equipotencial del campo de gravedad de la Tierra coincidente aproximadamente con el nivel promedio del mar Debido a que la distribución de masas a lo largo de la Tierra no es uniforme la forma del geoide no es constante y presenta irregularidades
Debido a estas irregularidades y a la complejidad de su definición la superficie de la Tierra tiende a representarse con mucha aproximación mediante un eliposide de revolución (superficie que se obtiene al girar una elipse alrededor de uno de sus ejes principales)
Debido a estas dificultades se define la Tierra para el estudio de puntos y líneas como una esfera perfecta cuyo radio medio se mide desde el centro de la Tierra hasta la superficie del mar

A continuación se detallan sus dimensiones aproximadas:
-{{pause:list}} Diámetro: 12.742 KM{{pause:acronym}}
-{{pause:list}} Radio: 6.371 Km
-{{pause:list}} Perímetro: 40.076 Km
-{{pause:list}} Volumen: 108.321 X 10^10 Km3
-{{pause:list}} Superficie: 510 X 10^6 Km2

## 2.2. Puntos y líneas destacados en la tierra

El conocimiento de los puntos y líneas más importantes de la Tierra permite crear sistemas de coordenadas que representan los puntos de su superficie en un mapa Se toma como referencia una forma esférica perfecta ya que facilita y simplifica el estudio de los puntos y líneas destacados en la Tierra:

-{{pause:list}} **Centro de la Tierra**: es el punto de simetría de la Tierra y tiene la propiedad de que «equidista» de todos los puntos de su superficie la distancia de 6.371 Km
-{{pause:list}} **Eje terrestre**: es una línea ideal que atraviesa la Tierra pasando por su centro De los infinitos ejes que tiene la Tierra el más importante es el de rotación cuya prolongación pasa por un punto fijo del universo llamado estrella polar
-{{pause:list}} **Polos Geográficos**: se denominan así a los puntos en los que el eje de rotación de la Tierra corta a la superficie terrestre existiendo de esta manera dos polos geográficos:
    -{{pause:list}} Polo Norte Geográfico (PNg)
    -{{pause:list}} Polo Sur Geográfico (PSg)
-{{pause:list}} **Círculos máximos**: son unos círculos ideales definidos por planos que pasan por el centro de la Tierra La circunferencia de cualquier círculo máximo mide 40.076 Km Tienen la propiedad de dividir a la Tierra en dos partes iguales llamadas hemisferios
-{{pause:list}} **Meridianos**: son los infinitos semicírculos máximos que pasan por los polos de la Tierra Dos meridianos opuestos forman un círculo máximo que divide a la Tierra en dos hemisferios Los meridianos se caracterizan porque cortan perpendicularmente al Ecuador y a todos los paralelos El más importante de todos los meridianos es el llamado meridiano de origen o de Greenwich que pasa por el observatorio astronómico situado en ese distrito de la ciudad de Londres y que fue considerado como meridiano de referencia del sistema horario a partir de 1884. Tomando como referencia dicho meridiano se divide la Tierra en dos hemisferios:
    -{{pause:list}} Hemisferio oriental: situado al ESTE del meridiano origen
    -{{pause:list}} Hemisferio occidental: situado al OESTE{{pause:acronym}} del meridiano origen
-{{pause:list}} **Ecuador terrestre**: es el círculo máximo cuyo plano es perpendicular al eje de la Tierra El Ecuador divide a la esfera terrestre en dos hemisferios:
    -{{pause:list}} Hemisferio norte: contiene al Polo Norte
    -{{pause:list}} Hemisferio sur: contiene al Polo Sur
-{{pause:list}} **Círculos menores**: son unos círculos ideales definidos por planos que no pasan por el centro de la Tierra Tienen la propiedad de dividir a la Tierra en dos partes desiguales llamadas casquetes esféricos
-{{pause:list}} **Paralelos**: se denominan así a los círculos menores y paralelos al Ecuador Son perpendiculares a los meridianos y tienen la propiedad de que por cualquier punto de la superficie terrestre pasa un paralelo Los paralelos más importantes son el Círculo Polar Ártico Círculo Polar Antártico Trópico de Cáncer y el Trópico de Capricornio

## 2.3. Movimientos de la tierra y sus efectos

La importancia del estudio de los movimientos de la Tierra se debe a la influencia que ejercen a la hora de tomar referencias cartográficas y realizar cálculos de rutas y ajustes electrónicos debidos a las desviaciones del norte magnético causadas por los movimientos terrestres Se abordarán los cuatro movimientos de la Tierra que tienen más importancia (rotación traslación precesión y nutación) de los más de 16 descritos en la actualidad
Aunque los cuatro movimientos se expliquen por separado el movimiento de la Tierra debe entenderse como un solo movimiento compuesto por los otros movimientos

### 2.3.1 Rotación

El movimiento de rotación de la Tierra es el que ésta realiza sobre sí misma alrededor del eje de rotación que pasa por los Polos
a La distancia angular es de 360º y el tiempo que tarda la Tierra en girar sobre sí misma es de 23 horas 56 minutos y 4 segundos
b La dirección de este movimiento es de oeste a este y la velocidad de rotación es variable debido principalmente a las fuerzas gravitatorias de su satélite la Luna
c El principal efecto del movimiento de rotación de la Tierra es el día y la noche Otra consecuencia de la rotación es la forma achatada del planeta debida principalmente a las fuerzas centrífugas generadas por este movimiento

### 2.3.2 Traslación

Es el que efectúa la Tierra alrededor del Sol
a El tiempo que tarda es de 365 días La trayectoria u órbita recorrida se llama Eclíptica y es una elipse en uno de cuyos «focos» se encuentra situado el Sol
b Debido a que la Tierra describe una órbita elíptica la distancia entre el Sol y la Tierra no es constante siendo el punto más alejado el afelio (en torno al 4 de julio) y el punto más cercano el perihelio (4 de enero)
c Los efectos causados son las variaciones climáticas (primavera verano otoño e invierno) debidas también a la inclinación del eje de rotación terrestre formando éste con el plano de la órbita elíptica un ángulo aproximado de 66º33´

Debida a esta inclinación los efectos sobre los distintos puntos terrestres son:
-{{pause:list}} Trópico de Cáncer: paralelo situado a una distancia angular de 23º27´ al norte del Ecuador Sobre él los rayos solares inciden perpendicularmente una vez al año en el Solsticio de Verano éste será el día del año con más horas de luz solar en el hemisferio norte y por tanto el día más corto del año en el hemisferio sur
-{{pause:list}} Trópico de Capricornio: paralelo situado a una distancia angular de 23º27´ al sur del Ecuador Sobre él los rayos solares inciden perpendicularmente una vez al año en el Solsticio de Invierno éste será el día del año con menos horas de luz solar en el hemisferio norte y por lo tanto será el día más largo del año en el hemisferio sur
-{{pause:list}} Los momentos en los que los rayos solares inciden perpendicularmente sobre el Ecuador son denominados Equinoccios y se caracterizan por la equivalencia en el número de horas nocturnas y diurnas

La combinación del movimiento de traslación y de rotación unido a la inclinación del eje de rotación causan los ciclos climáticos y atmosféricos del planeta la duración del día la dirección de los vientos predominantes la cantidad de radiación solar y el movimiento aparente de los astros
Dichas consecuencias tienen gran importancia en la  aérea a la hora de realizar el cálculo de rutas corrección de errores previsiones meteorológicas estimación de tiempos de vuelo etc

### 2.3.3 Precesión

Consiste en el desplazamiento del eje de rotación en el espacio La trayectoria descrita por el eje es un cono cuyo ciclo es tan extraordinariamente lento que tarda alrededor de 25.700 años en recorrerlo
a Este movimiento es el causante de que las estrellas cambien de posición respecto a la Tierra de hecho la Estrella Polar que ha sido referente para la  durante muchos siglos por señalar la posición del norte geográfico ha variado su posición aproximadamente 1º respecto al norte geográfico
b El sentido del movimiento del eje es contrario al de rotación de la Tierra y la velocidad de su desplazamiento es aproximadamente de 50 minutos anuales
c La precesión es causada por fuerzas gravitatorias principalmente del Sol y la Luna hacia la Tierra que al no ser esférica sino ensanchada en el Ecuador provoca la aparición de pares de fuerzas que alteran la posición de equilibrio del eje de rotación

### 2.3.4 Nutación

Este movimiento en sí consiste en una ligera oscilación del eje terrestre producida sobre la trayectoria del movimiento de precesión Cada ciclo de nutación dura algo más de dieciocho años durante los cuales el eje oscila aproximadamente 9 minutos alrededor de su posición media
a Está provocado sobre el eje de rotación y es superpuesto al de precesión Los mismos factores que causan la precesión de la Tierra son los que originan su nutación
b El principal efecto que surge de la combinación del movimiento de precesión y nutación es la variación de la posición del norte magnético

## 2.4. Nociones básicas de 

Además de los movimientos de la Tierra hay otros conceptos relevantes en el estudio de la  y la cartografía A continuación se explican conceptos básicos de  y sus aplicaciones a la cartografía necesarios para poder interpretar correctamente los mapas cartográficos específicos

### 2.4.1 Magnetismo terrestre

La tierra funciona como un enorme imán creando su propio campo magnético y teniendo dos polos: un polo Norte y uno Sur aunque estos polos magnéticos no están alineados con los polos geográficos:
-{{pause:list}} Polo Norte Magnético: Es aquel por donde entran las líneas de fuerza de Campo Magnético Terrestre
-{{pause:list}} Polo Sur Magnético: Es aquel por donde salen las líneas de fuerza del Campo Magnético Terrestre

### 2.4.2 Declinación magnética

Como los polos magnéticos apuntan siempre al norte magnético podremos decir que la declinación magnética en un punto de la Tierra es el ángulo comprendido entre el norte magnético local y el geográfico
La declinación puede ser:
-{{pause:list}} Este (E) o positiva cuando un observador situado en el lugar mirando al norte geográfico viera el norte magnético a su derecha
-{{pause:list}} Oeste (W) o negativa cuando un observador situado en el lugar mirando al norte geográfico viera el norte magnético a su izquierda

### 2.4.3 Rumbo

Se define rumbo como la distancia angular entre el norte de referencia y el eje longitudinal de la aeronave
Cuando el norte de referencia sea el magnético se habla de rumbo magnético cuando sea el geográfico se habla de rumbo geográfico
Los rumbos se denominan por medio de tres cifras que representan el ángulo respecto al origen que es el Norte geográfico o magnético según se considere y medido en sentido de giro de las agujas del reloj

El cálculo de los rumbos se basará en la siguiente fórmula:
**Rumbo magnético = Rumbo geográfico – declinación**
La declinación será negativa para W y positiva para E

### 2.4.4 Ruta

Se define como la proyección del movimiento de una aeronave persona u objeto sobre la superficie terrestre
La ruta trazada sobre una carta de  hace referencia a la trayectoria que une el punto de salida con el punto de destino Podrá ser magnética o geográfica según se tome como referencia el Norte Magnético o el Geográfico
Siempre que la  se lleve a cabo en ausencia de viento el rumbo de la aeronave coincidirá con el de la ruta que sobrevuela Sin embargo el viento en ocasiones provoca que el rumbo de la aeronave no coincida con el de la ruta sobrevolada en estos casos la aeronave puede desplazarse a través de un rumbo que no es el propio

Los dos tipos de rutas más importantes son: la Ruta Ortodrómica y la Ruta Loxodrómica

{{pause:table}}| RUTA ORTODRÓMICA | RUTA LOXODRÓMICA |
| :--- | :--- |
| Es arco de círculo máximo que une dos puntos sobre la superficie terrestre. | Es aquélla que describimos sobre la superficie terrestre cuando nos desplazamos de un punto a otro manteniendo un rumbo constante en la brújula. |
| Ruta más corta entre dos puntos | Es más larga que la ortodrómica. |
| Distancias: Para grandes distancias, la diferencia es importante, y se preferirá seguir la ortodrómica al ser más corta. | Distancias: para pequeñas distancias (rutas inferiores a 1.000 Km) la diferencia es pequeña y se suele seguir la loxodrómica, ya que permite mantener un rumbo constante sin que por ello se recorra una distancia mucho mayor. |
| Forma ángulos distintos con cada meridiano excepto cuando dicha ruta coincide con un meridiano o con el Ecuador. | Forma el mismo ángulo con todos los meridianos |
| Es difícil de seguir | Es fácil de seguir |{{pause:end}}

En el ámbito aeronáutico la ortodrómica sigue siendo fundamental especialmente para a largas distancias ya que el consumo o mejor dicho el ahorro de combustible es uno de los objetivos principales del transporte aéreo
En el ámbito aeronáutico la  loxodrómica cae en desuso Su cualidad de simplicidad en la  ha sido superada por la precisión de los sistemas modernos de 

A partir de estos arcos de círculo máximo u ortodrómico se define una de las unidades de medida de longitud más utilizadas en : la **milla náutica (NM{{pause:acronym}})** definida como la longitud recorrida en un minuto sobre un arco de círculo máximo 1NM = 1.852 km

### 2.4.5 Deriva

Un avión se desplaza en el interior de una masa de aire luego el movimiento de esta masa de aire afectará al desplazamiento del avión con respecto a la ruta que desea llevar
El ángulo existente entre la ruta deseada de una aeronave y la dirección del movimiento de la misma se denomina deriva y es un factor importante a tener en cuenta para que el viento no altere la ruta de la misma
La máxima deriva se produce cuando la dirección del viento es perpendicular al rumbo de la aeronave y es mínima o nula cuando la dirección del viento coincide con la de la aeronave

### 2.4.6 Derrota

Se define la derrota como la proyección sobre el suelo de la trayectoria que ha seguido la aeronave al intentar sobrevolar una determinada ruta Por lo tanto es el resultado de la corrección de los distintos rumbos tomados por la aeronave para seguir su ruta
La derrota se debe principalmente a los vientos ya que no siempre es sencillo sobrevolar una ruta determinada y generalmente a lo largo de un vuelo se han de hacer sucesivas correcciones de rumbo para evitar abandonar la ruta

## 2.5 Sistemas de referencia terrestre

El trazado de un mapa requiere el establecimiento de un método que permita localizar puntos concretos de la superficie terrestre para su posterior representación
Con este objetivo se han desarrollado diferentes modelos matemáticos caracterizados básicamente por:
1.{{pause:list}} Un sistema de coordenadas que permite posicionar puntos sobre el elipsoide
2.{{pause:list}} Datum: Conjunto de parámetros que fijan el origen la orientación y la escala del sistema de coordenadas con respecto a un elipsoide de referencia (un modelo asociado de la forma de la tierra)

### 2.5.1 Sistema de coordenadas geográficas

El sistema de coordenadas geográficas es uno de los métodos más utilizados en la determinación de puntos sobre la superficie terrestre Dicha localización se realiza mediante dos distancias angulares tomando como referencia una aproximación esférica de la Tierra: Longitud y Latitud

-{{pause:list}} **Latitud**: Se llama latitud de un punto de la superficie terrestre a la distancia angular medida en grados sobre un meridiano entre dicho punto y el Ecuador que es la línea que se toma como origen de latitudes Se mide en grados minutos y segundos Varía de 0º a 90º y puede ser:
    -{{pause:list}} Norte o positiva (N): si el punto se encuentra por encima del Ecuador
    -{{pause:list}} Sur o negativa (S): si el punto se encuentra por debajo del Ecuador
    Según la definición de latitud los puntos situados sobre el Ecuador tienen como latitud 0º y los Polos tienen como latitud 90º por tanto todos los puntos de un mismo paralelo tienen la misma latitud

-{{pause:list}} **Longitud**: se llama longitud de un punto a la distancia angular medida en grados sobre el Ecuador entre el meridiano del lugar y el meridiano de origen o de Greenwich Se mide en grados minutos y segundos Varía de 0º a 180º y puede ser:
    -{{pause:list}} Este o positiva (E): si el punto se sitúa a la derecha del meridiano origen
    -{{pause:list}} Oeste o negativa (W): si el punto se sitúa a la izquierda del meridiano origen
    Según la definición de longitud los puntos situados en el meridiano origen tienen como longitud 0º por tanto todos los puntos situados en un mismo meridiano tienen la misma longitud

### 2.5.2 Datum WGS84

La ambigüedad en el cálculo de coordenadas ocasionada por el uso de diferentes datums puso de manifiesto la necesidad de normalizar un modelo único de referencia que pudiera ser utilizado en diferentes aplicaciones
Con este objetivo el Departamento de Defensa estadounidense desarrolló el World Geodetic System 1984 (WGS84) un sistema de referencia geodésico universal con cobertura para toda la superficie terrestre definido por los siguientes parámetros:
1.{{pause:list}} Origen: centro de masas de la Tierra
2.{{pause:list}} Sistemas de ejes coordenados:
    -{{pause:list}} Eje Z: dirección del polo medio convencional terrestre definido por el IERS{{pause:acronym}} (Servicio Internacional de Rotación de la Tierra) perpendicular al plano fundamental (Ecuador medio) Coincidente con el eje medio de rotación de la Tierra
    -{{pause:list}} Eje X: formado por la intersección determinada por el plano del Ecuador y el meridiano de Greenwich también definido por el IERS{{pause:acronym}}
    -{{pause:list}} Eje Y: situado sobre el plano del Ecuador medio y a 90° a la derecha del eje X formando junto con el eje Z un triedro a derechas siendo el origen del triedro el centro de masas de la Tierra
3.{{pause:list}} Elipsoide WGS84: elipsoide de revolución definido por los parámetros:
    -{{pause:list}} Semieje mayor (a) = 6 378 137 m
    -{{pause:list}} Semieje menor (b) = 6 356 752 m
    -{{pause:list}} Constante de Gravitación Terrestre: GM{{pause:acronym}} = (3986004.418 ± 0.008) x 10^8 m3 / s2.
    -{{pause:list}} Velocidad angular: W= 7292115 x 10^-11 rad/s
    -{{pause:list}} Coeficiente de forma dinámica: J2= -484166 85 x 10^-6.

Las coordenadas aeronáuticas publicadas en el AIP{{pause:acronym}}-ESPAÑA están referidas al sistema geodésico WGS84 de acuerdo con lo establecido en el Anexo 15 de la OACI{{pause:acronym}} El Real Decreto 1071/2007 de 27 de julio adaptación del mandato de la Comisión Europea de 1999 por el que se regula el sistema geodésico de referencia oficial en España establece que se adopta el sistema ETRS89 (European Terrestrial Reference System 1989) como sistema de referencia geodésico oficial en España para la referenciación geográfica y cartográfica en el ámbito de la península Ibérica y las Islas Baleares En el caso de las islas Canarias se adopta el sistema REGCAN95.
Ambos sistemas tienen asociado el elipsoide GRS80 (Sistema de Referencia Geodésico 1980) y están materializados por el marco que define la Red Geodésica Nacional por Técnicas Espaciales REGENTE y sus densificaciones Inicialmente teniendo en cuenta la exactitud requerida para los diferentes datos establecidas en el Catálogo de Datos Aeronáuticos ETRS89 y REGCAN95 se consideraron equivalentes a WGS84.
Sin embargo debido a la deriva existente entre estos sistemas se han hallado discrepancias cada vez mayores que la exactitud requerida para algunos datos por lo que los sistemas ETRS89 y REGCAN95 no se pueden considerar válidos para la publicación de coordenadas en AIP{{pause:acronym}} ESPAÑA

# 3. Representación de la superficie terrestre

Una vez que se ha estudiado la forma y las dimensiones de la Tierra así como la localización de sus puntos y líneas más característicos en este apartado se aborda el objetivo de examinar los distintos métodos que se utilizan para representar la superficie terrestre o parte de ella sobre un plano o una superficie desarrollable

## 3.1 La escala

En general la representación gráfica de objetos es una tarea que suele plantear dificultades en relación con sus dimensiones Si se pretendiera reproducir a tamaño real un objeto demasiado grande sería necesario utilizar un formato de representación de medidas poco manejables En el caso de objetos muy pequeños surgiría el inconveniente de la falta de precisión en su definición
Esta problemática se resuelve a través de la escala que se define como la relación entre la dimensión real de un objeto y su representación gráfica
En otras palabras la escala es un factor de reducción o ampliación que se aplica a la representación de un objeto con el fin de ajustar su definición y obtener el formato de dibujo deseado
Existen diversas formas de expresar la escala pero las dos más comunes son la gráfica y la numérica

### 3.1.1 La escala numérica

Se formula mediante una fracción cuyo numerador es la medida de la distancia lineal de un objeto en su representación sobre el plano y cuyo denominador refleja la magnitud real de esa misma distancia
**E= Longitud en el plano/ Longitud en el terreno**
Ejemplo: si la escala de un plano es 1:10 una distancia en el plano de 5 cm equivale a una distancia en el terreno de 5x10= 50 cm
Se han de utilizar siempre las mismas unidades ya que de no ser así se perderían las proporciones

-{{pause:list}} **Escalas de reducción**: cuando el numerador es menor que el denominador
    -{{pause:list}} Una escala es grande cuando el denominador es pequeño es decir abarcan poco terreno se emplean para representar ciudades fincas caminos etc Ejemplo: 1:5.000 1:10.000.
    -{{pause:list}} Una escala es pequeña cuando el denominador es grande es decir abarcan mucho terreno se emplean para representar países y continentes Ejemplo: 1:5.000.000 1:7.000.000.
-{{pause:list}} **Escala de ampliación**: Si el numerador de la fracción es mayor que el denominador
-{{pause:list}} **Escala natural**: corresponde a la representación de un objeto a tamaño real (1:1)

### 3.1.2 La escala gráfica

Se expresa a través de una línea graduada en distintas divisiones asignando a cada una de ellas su equivalencia con la magnitud real
A través de este método se puede reconocer las proporciones reales sobre una representación de una manera visual y sin cálculos
Por ejemplo para una escala 1/5.000.000 una división de la escala gráfica de un centímetro aparecerá graduada en 50 Km que es la longitud equivalente en la realidad

## 3.2 Las proyecciones cartográficas

### 3.2.1 Concepto

Se entiende por sistema de representación o proyección cartográfica a las trasformaciones matemáticas que permiten representar o proyectar la Tierra en un plano
Dado que no existe la posibilidad geométrica y/o analítica de transformar un área esférica en una plana sin deformarla cualquier mapa generado a partir de una proyección cartográfica llevará implícitas una serie de distorsiones respecto a la superficie real que representa que tienen que ver con las distancias entre puntos los ángulos entre líneas o curvas y la equivalencia entre áreas
Por este motivo las proyecciones cartográficas no sólo estudian la forma de reproducir la superficie terrestre sino que también intentan minimizar en la medida de lo posible las alteraciones causadas en el proceso

La elección del tipo de proyección a utilizar en un caso determinado dependerá principalmente de dos factores:
1.{{pause:list}} La zona de la superficie terrestre que se quiera representar
2.{{pause:list}} La especialización del mapa es decir la finalidad para la que se construya Éste es un factor clave ya que el uso de una proyección concreta puede evitar determinadas distorsiones geométricas que dificulten la utilización práctica del mapa

### 3.2.2 Clasificación

Las proyecciones cartográficas se pueden clasificar de diferentes maneras:

**A Atendiendo al tipo de magnitud geométrica que el mapa sea capaz de conservar respecto a la real**
-{{pause:list}} **Proyecciones conformes**: Conserva el ángulo entre dos puntos medidos en la superficie de referencia y el mapa
-{{pause:list}} **Proyecciones equivalentes**: Conserva la proporcionalidad entre las áreas A este respecto es necesario aclarar que la equivalencia no es posible sin deformar considerablemente los ángulos originales Por lo tanto ninguna proyección puede ser equivalente y conforme a la vez
-{{pause:list}} **Proyecciones equidistantes**: Guardan la proporcionalidad entre las distancias En la práctica no existe ninguna proyección capaz de conservar esta propiedad a lo largo de todo el mapa Sin embargo puede conservarse a lo largo de determinadas líneas que se denominan automecoicas
-{{pause:list}} **Proyecciones afilácticas**: No poseen ninguna de las tres propiedades señaladas

Para la  aérea por ejemplo es interesante el uso de cartas que no deformen los ángulos entre rumbos o la distancia entre dos puntos Está matemáticamente demostrado que no existe ningún sistema de proyección en el que se mantengan las tres dimensiones sino solamente una de ellas

**B Atendiendo a la forma de proyección:**

1.{{pause:list}} **PROYECCIONES PURAS{{pause:acronym}}**: Resultan de la verdadera proyección geométrica de la superficie terrestre o parte de ella sobre un plano o una superficie desarrollable
    -{{pause:list}} **Proyecciones planas o perspectivas**: Resultan de la proyección geométrica de los puntos de la superficie terrestre sobre un plano
        -{{pause:list}} Según el lugar donde se sitúe el centro de proyección:
            -{{pause:list}} Ortográficas: el foco de proyección se encuentra fuera de la superficie terrestre y a una distancia infinita de la misma
            -{{pause:list}} Escenográficas: el foco de proyección se encuentra fuera de la superficie terrestre a una distancia finita
            -{{pause:list}} Estereográficas: cuando el foco de proyección se encuentra sobre la superficie terrestre
            -{{pause:list}} Gnomónicas: el foco de proyección se encuentra en el centro de la superficie terrestre
        -{{pause:list}} En función de la posición del plano de proyección:
            -{{pause:list}} Polares: el plano el cuadro es tangente a la superficie terrestre en uno de sus Polos
            -{{pause:list}} Ecuatoriales: el plano de proyección es tangente en algún punto del Ecuador
            -{{pause:list}} Horizontales: el plano de proyección es tangente a algún punto no significativo de la superficie terrestre
    -{{pause:list}} **Proyecciones por desarrollo**: Resultan de la proyección geométrica de los puntos de la Tierra sobre una superficie desarrollable
        -{{pause:list}} Dependiendo de la posición relativa de la superficie de proyección:
            -{{pause:list}} Directa: el eje de la superficie de proyección es paralelo al eje de rotación terrestre
            -{{pause:list}} Transversal: el eje de la superficie de proyección es perpendicular al eje de rotación terrestre
            -{{pause:list}} Oblicua: el eje de la superficie de proyección forma un ángulo comprendido entre 0º y 90º con el eje de rotación terrestre
        -{{pause:list}} Tipos:
            -{{pause:list}} Cónicas: aquéllas en las que la superficie de proyección es un cono tangente o secante a la superficie terrestre de referencia
            -{{pause:list}} Cilíndricas: aquéllas en las que la superficie de proyección es un cilindro tangente o secante a la esfera

2.{{pause:list}} **PROYECCIONES MODIFICADAS**: Recurren a distintos artificios geométricos y analíticos para conseguir que una determinada proyección pura adquiera alguna propiedad que no posea originariamente con el fin de disminuir las distorsiones geométricas en determinadas áreas que resulten de interés para el uso de la carta En la actualidad la mayoría de los mapas se hacen a base de proyecciones modificadas Entre las más populares se encuentran las proyecciones de Bonne Lambert Mercator Mollweide Goode o Boggs

### 3.2.3 Aplicación de las proyecciones cartográficas en la aeronáutica

Las proyecciones cónicas tienen un uso muy extendido en la cartografía aeronáutica especialmente en lo referido a la  en ruta debido a la facilidad y exactitud con la que se pueden representar las trayectorias
Las cónicas más utilizadas son las gnomónicas-directas en las que el plano cónico es tangente a la superficie terrestre a lo largo de un paralelo que se denomina estándar
Este tipo de proyección tiene varias características importantes:
1.{{pause:list}} Los meridianos se transforman en rectas concurrentes en el Polo y los paralelos en arcos de circunferencias concéntricas en el punto de concurrencia de los meridianos Ambos tipos de línea mantienen un ángulo constante de 90º
2.{{pause:list}} La proyección es conforme por su propia construcción a lo largo de toda la representación Las distorsiones lineales y superficiales son mínimas en las inmediaciones del paralelo estándar (único automecoico es decir sin deformación lineal) y aumentan según se aleja de esta línea

La proyección cónica conforme de Lambert es una proyección modificada que se basa en la directa-gnomónica pero sustituye el cono tangente por uno secante
Lambert calculó matemáticamente la posición de los paralelos de corte del cono de proyección con la superficie terrestre:
a consiguiéndose dos paralelos estándares automecoicos y
b logrando que las deformaciones lineales queden reducidas a la mitad del valor absoluto de las que se producirían en el caso de usar un cono tangente
De este modo no sólo se mantiene una constancia en la escala bastante extendida en la carta sino que además por ser ésta conforme la distorsión de las áreas es mínima

La proyección cónica conforme de Lambert resulta de enorme utilidad para la  aérea por diversos motivos:
-{{pause:list}} Al tratarse de una carta conforme y prácticamente equidistante se pueden medir los rumbos y las distancias directamente sobre ella con bastante precisión
-{{pause:list}} La ortodrómica se representa -con gran aproximación- por una recta por lo que el trazado de una ruta de estas características puede realizarse uniendo directamente los puntos sobre la carta
-{{pause:list}} La loxodrómica está representada por una curva con la concavidad orientada hacia el vértice de la proyección

## 3.3 Las representaciones topográficas

La topografía es la ciencia que se ocupa de la representación de pequeñas extensiones de la superficie terrestre En esta labor la principal dificultad reside en el alto grado de irregularidad que presentan normalmente los terrenos naturales
A efectos prácticos cuando la superficie terrestre a representar no abarca grandes dimensiones se puede obviar su esfericidad y aproximarse a un plano sin cometer grandes errores de precisión En estos casos el procedimiento más utilizado para el trazado del relieve se basa en la comparación de las altitudes de sus puntos respecto al plano correspondiente al nivel medio del mar
Por esta razón se suele emplear el sistema de planos acotados un método de representación que emplea un único plano de proyección -denominado plano de referencia o del cuadro sobre el que se trazan los objetos mediante una proyección cilíndrica y ortogonal
En este sistema un punto quedará definido por sus coordenadas planas en el cuadro y la distancia vertical al mismo (cota) afectada del signo + o - según esté situado por encima o por debajo
No obstante si sólo se realizara una representación puntual del terreno se correría el riesgo de perder precisión en el plano (en el caso de escoger un escaso número de puntos) o de hacerlo ininteligible (en caso de representar demasiados) Por este motivo se usa el sistema de curvas de nivel que se expone a continuación

### 3.3.1 El sistema de curvas de nivel

El sistema de curvas de nivel es un procedimiento de representación del relieve basado en el sistema de planos acotados que consiste en «cortar» el terreno por planos paralelos que contienen puntos que están a la misma altitud sobre el nivel del mar o sobre cualquier otro nivel de referencia
Dichos planos se encuentran separados por una misma distancia vertical denominada equidistancia
Cada sección produce un perímetro orográfico de igual cota que se proyecta en el plano del cuadro formando las denominadas curvas de nivel o isohipsas

Una de las ventajas de este sistema es que permite realizar cálculos sencillos –tales como la determinación de distancias áreas ángulos e incluso volúmenes- de una forma bastante precisa y simple en base al alzado del perfil topográfico de la zona Dado que en una proyección de este tipo las deformaciones son prácticamente nulas las operaciones se pueden hacer conforme a medidas directas de las distancias horizontales en el plano y el valor de la equidistancia
La precisión de los planos obtenidos por este sistema depende del valor de la equidistancia y la escala La definición aumentará con el tamaño de la escala pero para poder reflejar pequeños detalles será preciso tomar curvas de nivel muy cercanas entre ellas es decir disminuir la equidistancia
La topografía basada en curvas de nivel es muy común en determinadas cartas aeronáuticas que sirven de información para la  visual representan aeródromos o definen superficies delimitadoras de obstáculos

## 3.4 Simbología

En el ámbito cartográfico y topográfico los símbolos son figuras gráficas diseñadas para identificar en el mapa o el plano correspondiente aquellos objetos y/o elementos geográficos que o bien resulten imperceptibles en la propia representación o bien proporcionen una determinada información útil para la funcionalidad demandada por parte de los usuarios
Los símbolos se crean conforme a signos evocadores figurativos cuantitativos o ideogramas que produzcan una percepción significativa asociada a la realidad que pretenden representar
En función de la especialización de los mapas o planos el diseño de la simbología específica se suele ajustar a las normas que dicten los organismos correspondientes en cada caso En el caso de la cartografía aeronáutica la simbología empleada está normalizada en el Anexo 4 de OACI{{pause:acronym}}
En España por las necesidades de su cartografía ha sido necesario idear símbolos distintos a los de la OACI{{pause:acronym}} estos vienen recogidos en el GEN{{pause:acronym}} 2.3 del AIP{{pause:acronym}}-España indicados con un * que hace referencia a: “No incluidos en el ANEXO{{pause:acronym}} 4 de OACI{{pause:acronym}}”
Además de los símbolos los mapas y planos –según su propósito- también suelen incluir nombres números siglas valores etc teniendo en cuenta la adecuación del color la forma la dimensión la orientación y la ubicación

# 4. Cartas aeronáuticas

La carta aeronáutica se define como la representación de una porción de tierra su relieve y construcciones diseñada especialmente para satisfacer los requisitos de la  aérea
La seguridad de la  aérea exige el establecimiento oportuno de cartas aeronáuticas actualizadas y precisas que respondan a las necesidades actuales de la aviación En la actualidad la Organización de Aviación Civil Internacional (OACI{{pause:acronym}}) se erige como el mayor órgano de regulación mundial para la aviación civil que dictamina las normas y las recomendaciones necesarias para la seguridad eficiencia y ordenación del transporte aéreo internacional indicando que cada Estado tiene la obligación de proporcionar información del propio territorio a través de las cartas aeronáuticas

a Las cartas aeronáuticas se desarrollan en el Anexo 4 y en el Documento 8697{{pause:doc}} de la OACI{{pause:acronym}}
b En el Anexo 15 «Servicios de Información Aeronáutica» recoge que es el Servicio de Información Aeronáutica (AIS{{pause:acronym}}) responsable de la producción de la cartografía aeronáutica necesaria utilizada por la aviación civil tanto nacional como internacional en territorio español y en aquellas zonas donde el Estado tenga la responsabilidad de suministrar servicios de tránsito aéreo
En España este servicio está gestionado por ENAIRE y específicamente en cuanto a la cartografía aeronáutica recae sobre la División AIS{{pause:acronym}}

## 4.1 Anexo 4 de OACI{{pause:acronym}} «CARTAS AERONÁUTICAS»

### 4.1.1 Generalidades

Cada Estado es responsable de su propia producción cartográfica atendiendo a las necesidades de sus servicios de tránsito aéreo Además de cumplir con las especificaciones de OACI{{pause:acronym}} (Anexo 4 y 15) puede desarrollar cartografías específicas con el propósito de adecuar la información publicada a sus necesidades
El Anexo 4 establece que las cartas deben ser de interpretación rápida y deben dejar abierto el camino para posibles mejoras de diseño es preciso encontrar un equilibrio entre la uniformidad de presentación de las cartas los requisitos operacionales y la aplicación de técnicas eficaces y económicas para ello la cooperación entre estados es fundamental
Se hace necesaria una organización cartográfica adecuada en cada Estado Todas las ramas de actividad implicadas en la realización y difusión de las cartas aeronáuticas deben estar al tanto de la relación funcional entre las cartas así como de las especificaciones y necesidades correspondientes

### 4.1.2 Aspectos recogidos en el Anexo 4

El Anexo 4 intenta dar una serie de normas y métodos recomendados que permitan la unificación del formato de las cartas para todos los países miembros mediante el desarrollo de puntos como:
1.{{pause:list}} Declaración de las diferencias que se tengan respecto a este Anexo
2.{{pause:list}} Publicación de información relativa a la disponibilidad de las cartas
3.{{pause:list}} Idioma de publicación (en España en la actualidad se están empezando a hacer bilingües las cartas: español e inglés)
4.{{pause:list}} Especificaciones generales tales como requisitos de utilización de la carta título símbolos etc
5.{{pause:list}} Desarrollo de cada una de las cartas y todas sus especificaciones específicas
Exhaustivamente se encuentra en el doc 8697{{pause:doc}} Manual de Cartas Aeronáuticas

## 4.2 Carácter de las cartas aeronáuticas

En el Manual de Cartas Aeronáuticas (Doc 8697{{pause:doc}} de la OACI{{pause:acronym}}) se indican los siguientes tipos de cartas atendiendo a su carácter:

### 4.2.1 Cartas obligatorias
-{{pause:list}} Plano de Obstáculos de Aeródromo - OACI{{pause:acronym}} Tipo A
-{{pause:list}} Carta Topográfica para Aproximaciones de Precisión – OACI{{pause:acronym}}
-{{pause:list}} Carta de  en Ruta – OACI{{pause:acronym}}
-{{pause:list}} Carta de Aproximación por Instrumentos – OACI{{pause:acronym}}
-{{pause:list}} Plano de Aeródromo / Helipuerto – OACI{{pause:acronym}}
-{{pause:list}} Carta Aeronáutica Mundial - OACI{{pause:acronym}} 1:1.000.000

### 4.2.2 Cartas opcionales
Sólo deben producirse si en opinión de las autoridades estatales su disponibilidad contribuiría a la seguridad regularidad y eficiencia de las operaciones de las aeronaves Estas cartas son:
-{{pause:list}} Plano de Obstáculos de Aeródromo - OACI{{pause:acronym}} Tipo B
-{{pause:list}} Plano de Aeródromo para Movimientos en Tierra - OACI{{pause:acronym}}
-{{pause:list}} Plano de Estacionamiento y Atraque de Aeronaves - OACI{{pause:acronym}}
-{{pause:list}} Carta Aeronáutica - OACI{{pause:acronym}} 1:500.000
-{{pause:list}} Carta de  Aeronáutica - OACI{{pause:acronym}} Escala Pequeña
-{{pause:list}} Carta de Posición – OACI{{pause:acronym}}

### 4.2.3 Cartas condicionalmente necesarias
Significa que solamente serían necesarias si se cumplen determinadas condiciones o circunstancias Estas cartas son:
-{{pause:list}} **Carta de Área - OACI{{pause:acronym}}**: sólo si las rutas de los servicios de tránsito aéreo o los requisitos de notificación de posición son complicados y no pueden indicarse en la Carta de  en Ruta - OACI{{pause:acronym}}
-{{pause:list}} **Carta de Salida Normalizada - Vuelo por Instrumentos (SID{{pause:acronym}}) - OACI{{pause:acronym}}**: debe producirse siempre que se haya establecido una ruta de salida normalizada de vuelo por instrumentos y ésta no puede indicarse con suficiente claridad en la Carta de Área - OACI{{pause:acronym}}
-{{pause:list}} **Carta de Llegada Normalizada - Vuelo por Instrumentos (STAR{{pause:acronym}}) - OACI{{pause:acronym}}**: debe prepararse siempre que se haya establecido una ruta de llegada normalizada de vuelo por instrumentos y ésta no pueda indicarse con suficiente claridad en la Carta de Área - OACI{{pause:acronym}}
-{{pause:list}} **Carta de Aproximación Visual - OACI{{pause:acronym}}**: debe prepararse para los aeródromos utilizados por la aviación civil internacional en los que solamente existen instalaciones y servicios limitados de  o en los que no se cuenta con instalaciones y servicios de radiocomunicaciones o en los que no existen otras cartas aeronáuticas adecuadas del aeródromo y de sus alrededores a escala 1:500.000 o escala superior o en los que se han establecido procedimientos de aproximación visual
-{{pause:list}} **Carta de altitud mínima de vigilancia ATC{{pause:acronym}} - OACI{{pause:acronym}}**: debe prepararse cuando se ha establecido procedimientos de guía vectorial y las altitudes mínimas de guía vectorial no puedan indicarse con suficiente claridad en la Carta de área - OACI{{pause:acronym}} la Carta de salida normalizada vuelo por instrumentos (SID{{pause:acronym}}) - OACI{{pause:acronym}} o la Carta de llegada normalizada - vuelo por instrumentos (STAR{{pause:acronym}}) - OACI{{pause:acronym}}

Además en España se producen otras cartas (solamente deben producirse si su disponibilidad contribuiría a la seguridad regularidad y eficiencia de las operaciones) como son:
-{{pause:list}} Carta de área de cobertura radar
-{{pause:list}} Carta de Altitud Minima de Vigilancia ATC{{pause:acronym}} (ATCSMAC) -OACI{{pause:acronym}} en TMA{{pause:acronym}}
-{{pause:list}} Carta de Circulación VFR{{pause:acronym}} en TMA{{pause:acronym}}
-{{pause:list}} Carta de Transición a la aproximación final - vuelo por instrumentos (TRAN{{pause:acronym}})
-{{pause:list}} Carta de llegada vuelo por instrumentos - Descenso Continuo
-{{pause:list}} Luces aeronáuticas de superficie - en ruta
-{{pause:list}} Carta de áreas prioritarias a evitar en vuelos particulares
-{{pause:list}} Carta de concentración de aves
-{{pause:list}} Carta de presencia de buitres y cigüeñas

## 4.3 Fases del vuelo y relación entre cartas

Cada carta aeronáutica tiene una finalidad específica y está orientada a ayudar al piloto a desarrollar correctamente una determinada fase del vuelo
En cada tipo de carta se proporcionará la información apropiada a la fase correspondiente del vuelo En función de la fase del vuelo las cartas a utilizar son:

**Fase 1. Rodaje desde el puesto de estacionamiento hasta el punto de despegue**
-{{pause:list}} Plano de Estacionamiento y Atraque de Aeronaves - OACI{{pause:acronym}}
-{{pause:list}} Plano de Aeródromo para Movimientos en Tierra - OACI{{pause:acronym}}
-{{pause:list}} Plano e Aeródromo / Helipuerto - OACI{{pause:acronym}}

**Fase 2. Despegue y ascenso hasta la estructura de rutas ATS{{pause:acronym}}**
-{{pause:list}} Plano de Obstáculos de Aeródromo - OACI{{pause:acronym}} Tipo A
-{{pause:list}} Carta de Salida Normalizada - Vuelo por Instrumentos (SID{{pause:acronym}}) - OACI{{pause:acronym}}
-{{pause:list}} Carta de altitud mínima de vigilancia ATC{{pause:acronym}} – OACI{{pause:acronym}}

**Fase 3. Estructura de rutas ATS{{pause:acronym}} en ruta**
-{{pause:list}} Carta de Área - OACI{{pause:acronym}} Rutas de salida y tránsito
-{{pause:list}} Carta de  en Ruta - OACI{{pause:acronym}}
-{{pause:list}} Carta de Área - OACI{{pause:acronym}} Rutas de llegada y tránsito
-{{pause:list}} Carta de Circulación VFR{{pause:acronym}}

**Fase 4: Descenso hasta la aproximación**
-{{pause:list}} Carta de Llegada Normalizada - Vuelo por Instrumentos (STAR{{pause:acronym}}) - OACI{{pause:acronym}}
-{{pause:list}} Carta de Llegada Vuelo por Instrumentos - Descenso Continuo (CDA{{pause:acronym}})
-{{pause:list}} Carta de Transición a la Aproximación Final - Vuelo por Instrumentos (TRAN{{pause:acronym}})
-{{pause:list}} Carta de altitud mínima de vigilancia ATC{{pause:acronym}} - OACI{{pause:acronym}}

**Fase 5: Aproximación para aterrizar**
-{{pause:list}} Carta de Aproximación por Instrumentos - OACI{{pause:acronym}}
-{{pause:list}} Carta Topográfica para Aproximaciones de Precisión - OACI{{pause:acronym}}
-{{pause:list}} Carta de Aproximación Visual - OACI{{pause:acronym}}
-{{pause:list}} Plano de Obstáculos de Aeródromo - OACI{{pause:acronym}} Tipo A (Limitaciones de utilización)

**Fase 6: Aterrizaje y rodaje hasta el puesto de estacionamiento de aeronave**
-{{pause:list}} Plano de Aeródromo / Helipuerto - OACI{{pause:acronym}}
-{{pause:list}} Plano de Aeródromo para Movimientos en Tierra - OACI{{pause:acronym}}
-{{pause:list}} Plano de Estacionamiento y Atraque de Aeronaves - OACI{{pause:acronym}}

## 4.4 Cartas aeronáuticas OACI{{pause:acronym}} y específicas publicadas por España

En este apartado se dará una breve explicación de las cartas aeronáuticas OACI{{pause:acronym}} pero solo de aquellas que España publica y de aquellas cartas que no son OACI{{pause:acronym}} pero contenidas en el AIP{{pause:acronym}}-España

### 4.4.1 Plano de Aeródromo / Helipuerto – OACI{{pause:acronym}}
Proporciona información detallada sobre el movimiento de las aeronaves en el área de maniobras del aeródromo incluyendo pistas calles de rodaje y plataforma

### 4.4.2 Plano de Aeródromo para Movimientos en Tierra – OACI{{pause:acronym}}
Este plano suplementario es necesario cuando el Plano de Aeródromo no puede mostrar con suficiente claridad el detalle de las calles de rodaje la plataforma y los puestos de estacionamiento

### 4.4.3 Plano de Estacionamiento y Atraque de Aeronaves – OACI{{pause:acronym}}
Proporciona información detallada sobre las posiciones de estacionamiento y las maniobras de entrada y salida de las mismas

### 4.4.4 Plano de obstáculos de Tipo A (Limitaciones de utilización)
Proporciona información sobre los obstáculos que limitan la carga útil de despegue

### 4.4.5 Carta Topográfica para Aproximaciones de Precisión - OACI{{pause:acronym}}
Proporciona información detallada sobre el perfil del terreno en la parte final de la aproximación para el uso de radioaltímetros

### 4.4.6 Carta de  en Ruta – OACI{{pause:acronym}}
Proporciona información sobre los servicios de tránsito aéreo (rutas puntos de notificación límites de espacio aéreo etc) para la  en ruta

### 4.4.7 Carta de Área – OACI{{pause:acronym}}
Proporciona información detallada de las rutas ATS{{pause:acronym}} y ayudas a la  en áreas terminales complejas

### 4.4.8 Carta de Salida Normalizada Vuelo por Instrumentos (SID{{pause:acronym}}) – OACI{{pause:acronym}}
Proporciona información sobre las rutas de salida designadas desde el aeródromo hasta la fase en ruta

### 4.4.9 Carta de Llegada Normalizada Vuelo por Instrumentos (STAR{{pause:acronym}}) – OACI{{pause:acronym}}
Proporciona información sobre las rutas de llegada designadas desde la fase en ruta hasta el punto de inicio de la aproximación

### 4.4.10 Carta de Llegada Vuelo por Instrumentos – Descenso Continuo (CDA{{pause:acronym}})
Proporciona información para realizar operaciones de descenso continuo reduciendo ruido y consumo de combustible

### 4.4.11 Carta de Transición a la Aproximación Final - Vuelo por Instrumentos (TRAN{{pause:acronym}})
Proporciona información para la transición desde la fase de llegada hasta la aproximación final

### 4.4.12 Carta de altitud mínima de vigilancia ATC{{pause:acronym}} - OACI{{pause:acronym}}
Proporciona información sobre las altitudes mínimas que pueden asignarse por el ATC{{pause:acronym}} cuando se utiliza vigilancia radar

### 4.4.13 Carta de Aproximación por Instrumentos (IAC{{pause:acronym}}) - OACI{{pause:acronym}}
Proporciona la información necesaria para realizar una aproximación por instrumentos y el aterrizaje incluyendo el procedimiento de aproximación frustrada

### 4.4.14 Carta de Aproximación Visual – OACI{{pause:acronym}}
Proporciona información para realizar una aproximación visual al aeródromo

### 4.4.15 Carta Aeronáutica - OACI{{pause:acronym}} 1: 500.000
Proporciona información para la  visual y para la planificación de vuelos a baja velocidad y corta/media distancia

### 4.4.16 Carta de circulación VFR{{pause:acronym}} para TMA{{pause:acronym}}
Proporciona información específica para la circulación de vuelos VFR{{pause:acronym}} en áreas terminales

### 4.4.17 Carta de Luces aeronáuticas de superficie - en ruta
Proporciona información sobre luces aeronáuticas de superficie que pueden servir como referencia para la 

### 4.4.18 Carta de áreas prioritarias a evitar en vuelos particulares
Proporciona información sobre áreas sensibles que deben evitarse

### 4.4.19 Carta de concentración de aves
Proporciona información sobre áreas con riesgo de impacto con aves

## 4.5 Presentación electrónica de cartas aeronáuticas
Las cartas aeronáuticas pueden presentarse en formato electrónico lo que facilita su actualización y uso en vuelo mediante dispositivos EFB{{pause:acronym}} (Electronic Flight Bag)

## 4.6 Mantenimiento de las cartas
Las cartas deben mantenerse actualizadas para garantizar la seguridad de las operaciones Los cambios se notifican a través del ciclo AIRAC{{pause:acronym}} (Aeronautical Information Regulation and Control)

# 5. BIBLIOGRAFÍA
-{{pause:list}} OACI{{pause:acronym}} Anexo 4
-{{pause:list}} OACI{{pause:acronym}} Doc 8697{{pause:doc}}
-{{pause:list}} AIP{{pause:acronym}} España

# 6. ANEXOS
(Sin contenido en el documento original)
