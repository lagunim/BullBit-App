/**
 * stories.js — Stories for Journeys and Achievements.
 *
 * Now supports a 1:1 mapping between achievements and stories.
 * Journey stories are identified by `journey: <number>`.
 * Achievement stories are identified by `id: <string>`.
 */

export const STORIES = [
  // ==================================================================================
  // JOURNEY STORIES (Level Ups)
  // ==================================================================================
  {
    id: 'el-despertar-del-camino',
    title: 'El Despertar del Camino',
    journey: 1,
    content: `El sol apenas lograba perforar la niebla de los Bosques Susurrantes cuando ajustaste las correas de tu mochila. No había bandas de música ni multitudes despidiéndote en la puerta de la aldea; solo el eco de tus propios pasos sobre la tierra húmeda. Durante los primeros días de este viaje, el silencio fue tu único compañero. La duda es un monstruo más pesado que cualquier armadura: ¿realmente eras capaz de cruzar la Gran Brecha?

Al tercer día, encontraste un carro volcado. No había señales de lucha, solo una rueda rota y un rastro de manzanas esparcidas. Siguiendo el rastro, hallaste a un viejo cartógrafo atrapado bajo un fardo de suministros. "El mundo no espera a los que se quedan sentados", gruñó mientras lo ayudabas a levantarse. A cambio de tu fuerza, te entregó un mapa de cuero curtido. No era un mapa de tesoros, sino de rutas olvidadas. Al despedirse, te miró a los ojos: "La aventura no es llegar al final, muchacho, es no dar media vuelta cuando las botas empiezan a pesar". Esa noche, mientras acampabas bajo un cielo estrellado que nunca habías visto desde tu ventana, comprendiste que el mapa estaba en blanco en muchas zonas. Esas zonas eran tuyas para escribirlas. El viaje había comenzado de verdad.`,
  },
  {
    id: 'la-posada-de-los-suspiros',
    title: 'La Posada de los Suspiros',
    journey: 2,
    content: `Llegaste a la ciudad fronteriza de Oakhaven con barro hasta las rodillas y un hambre que podría haber devorado un dragón pequeño. Buscando refugio, entraste en "La Posada del Trasgo Ciego". Lo que esperabas que fuera una cena tranquila se convirtió en el caos más absoluto. Un bardo semi-elfo, claramente bajo los efectos de demasiada sidra de manzana, intentaba convencer a un grupo de mercenarios de que él había inventado la gravedad.

"¡Si no fuera por mi balada de 1412, todos estaríamos flotando en el techo!", gritaba mientras intentaba, sin éxito, mantenerse en pie. Te viste arrastrado a una competición de pulsos contra una mujer orco llamada Grogda, cuya risa hacía vibrar las vigas del techo. No ganaste (nadie le gana a Grogda), pero tu honestidad al admitir la derrota te valió una jarra de hidromiel por cuenta de la casa y una historia sobre cómo los orcos consideran que perder con gracia es más honorable que ganar con trampas. Pasaste la noche riendo, compartiendo anécdotas de tus hábitos —esas "misiones" que te habías autoimpuesto— y descubriendo que, a veces, el mayor peligro de un aventurero no es una espada, sino un bardo con exceso de confianza y una taberna llena de gente con ganas de fiesta. Saliste de Oakhaven con menos monedas, pero con el espíritu mucho más ligero.`,
  },
  {
    id: 'el-guardian-de-la-ruina',
    title: 'El Guardián de la Ruina',
    journey: 3,
    content: `En lo profundo del Cañón de las Sombras, encontraste la entrada a un templo que el tiempo había decidido olvidar. Las paredes estaban cubiertas de inscripciones que hablaban de un rey que quiso detener el tiempo para que su reino no pereciera. En el centro de la cámara principal, sobre un altar de mármol negro, descansaba un amuleto que brillaba con una luz pulsante. Era hermoso, y sentiste una vibración en tu pecho: aquel objeto te daría poder, facilitaría tus pasos, borraría el cansancio de tus piernas.

Sin embargo, a la salida te esperaba un niño. No, no era un niño; era un espíritu guardián, con ojos que contenían siglos de cansancio. "Si te llevas el amuleto", dijo con una voz que sonaba como el crujir de hojas secas, "la memoria de este lugar se desvanecerá. El poder que obtengas vendrá del olvido de los que sufrieron aquí". Tuviste que elegir. El camino por delante era largo y aquel objeto era una ventaja legítima. Miraste tus manos, callosas por el viaje, y luego al espíritu. Entendiste que el verdadero progreso no se roba, se construye. Dejaste el amuleto en el altar. Al salir del templo, el espíritu no te dio oro ni magia, pero el aire del cañón se sintió, por primera vez, cálido y acogedor. Habías ganado algo que ningún objeto puede dar: la certeza de que tu honor pesa más que tu ambición.`,
  },
  {
    id: 'la-dama-del-lago-de-hielo',
    title: 'La Dama del Lago de Hielo',
    journey: 4,
    content: `El invierno se adelantó mientras cruzabas los Picos de Plata. El frío no era solo una temperatura, era una presencia que intentaba dormir tus sentidos. Buscando refugio de una ventisca, llegaste a la orilla de un lago cuya superficie era un espejo de cristal perfecto. Allí, sentada sobre una piedra, una mujer de cabellos plateados lloraba lágrimas que se convertían en perlas antes de tocar el suelo.

Te contó que era la protectora del valle, y que su hermano, el viento del sur, se había marchado para no volver, dejando el lugar en un invierno eterno. Pasaste tres días ayudándola a recolectar las flores de escarcha que crecían bajo la nieve, las únicas que podían mantener viva la llama de su hogar. En el proceso, hablasteis de lo que significa perder algo que dábamos por sentado: una casa, un amigo, un tiempo que ya no volverá. No pudiste traer la primavera de vuelta, pero le diste algo que ella había olvidado: compañía en el dolor. Al marcharte, te entregó una de sus perlas de llanto. "Para que recuerdes", dijo, "que incluso en el frío más absoluto, la belleza persiste si alguien se molesta en buscarla". Caminaste hacia el siguiente valle con el corazón encogido, entendiendo que no todas las misiones terminan en victoria, pero todas dejan una huella.`,
  },
  {
    id: 'el-encuentro-en-la-encrucijada',
    title: 'Encrucijada de Destinos',
    journey: 5,
    content: `Habías recorrido cientos de leguas cuando llegaste a la Gran Encrucijada de los Tres Reinos. Allí, bajo un sauce llorón de hojas doradas, encontraste a otra viajera. Su armadura estaba tan abollada como la tuya y su capa tenía los mismos jirones causados por las zarzas del camino. No se dijeron nada al principio; simplemente compartieron el fuego. Ella cocinó unas raíces silvestres y tú ofreciste el poco pan seco que te quedaba.

A medida que la noche avanzaba, la conversación fluyó como un río tras el deshielo. No hablabais de grandes hazañas, sino de los miedos pequeños: el miedo a no ser suficiente, el miedo a que el viaje no tenga un destino real. Por un momento, en mitad de aquel mundo vasto y a menudo hostil, no fuiste un aventurero solitario. Fuiste parte de algo. Hubo una chispa, un entendimiento silencioso de que vuestras misiones, aunque distintas, compartían el mismo ritmo. Al amanecer, ella debía seguir hacia el este y tú hacia el norte. No hubo promesas de reencuentro eterno, solo un abrazo largo y el intercambio de una pequeña cinta roja. "Guárdala", te susurró, "para que cuando el camino sea oscuro, sepas que hay alguien en algún lugar que está caminando bajo el mismo cielo". Seguiste tu ruta con una sonrisa nueva, comprendiendo que el amor no siempre es un destino, a veces es el combustible para seguir andando.`,
  },
  {
    id: 'el-fuego-de-los-extranos',
    title: 'Fuego Compartido',
    journey: 6,
    content: `La nieve del Paso del Norte era cruel. El aventurero había perdido el rastro y su antorcha se había apagado. La noche se cernía, un manto negro lleno de aullidos lejanos. La muerte por frío parecía inevitable. Fue entonces cuando vio un resplandor anaranjado entre los árboles.

Se acercó con cautela, mano en la empuñadura. En un pequeño refugio de piedra, encontró a tres viajeros: una elfa arquera, un enano herrero y un bardo humano con una pata rota. Nadie desenvainó armas. El enano simplemente apartó una piedra cerca del fuego y dijo: "Siéntate. El fuego es de todos y de nadie".

Esa noche no hubo batallas. Compartieron un guiso terrible hecho de raíces y carne seca. El bardo tocó una flauta desafinada, la elfa contó historias de ciudades flotantes y el aventurero, por primera vez, habló de sus miedos, no de sus victorias. Se dieron cuenta de que provenían de mundos distintos, enemigos en otras tierras, quizás rivales en otros tiempos.

Pero esa noche, bajo la nieve y el fuego, eran solo almas calentándose las manos. Al amanecer, el aventurero se levantó para partir. No intercambiaron promesas de reencontrarse, ni juramentos eternos. Solo una mirada de respeto. Un aventurero suele caminar solo, pero las mejores historias nacen de esos breves instantes donde el camino se cruza con el de otro. Salió al frío, pero por primera vez en semanas, no sentía el helor en el pecho; llevaba el calor del fuego compartido guardado como un talismán invisible.`,
  },
  {
    id: 'el-umbral-de-los-susurros',
    title: 'El Bosque de Niebla',
    journey: 7,
    content: `El aventurero se detuvo al borde del Bosque de Vyr, donde la niebla no tocaba el suelo, sino que flotaba como un mar de leche. No había bestias ni trampas a la vista, solo un silencio tan profundo que dolía en los oídos. Había escuchado historias sobre este lugar: decían que el bosque no juzgaba tus habilidades con la espada, sino tu determinación. Dio un paso adelante. La niebla lo tragó al instante.

No hubo oscuridad, sino una luz tenue y verdosa. Los árboles aquí no eran madera, sino cristales fosilizados que vibraban con cada latido del corazón del viajero. Mientras avanzaba, el aventurero notó que el camino no era recto. Se retorcía según sus dudas. Si pensaba en rendirse, el suelo se volvía fango; si recordaba por qué había comenzado su travesía, el suelo se solidificaba en piedra firme.

En el centro del bosque, encontró un claro donde un anciano de roca tallaba figuritas. No levantó la vista, pero habló con una voz que sonaba a grava deslizándose: "Los héroes buscan el final del camino, los aventureros aprenden a caminar sobre la niebla".

El aventurero no buscó un tesoro ni un jefe final. Se sentó junto al anciano y observó cómo la niebla formaba figuras de lugares lejanos que aún no visitaba. Comprendió que este viaje no era sobre conquistar el bosque, sino sobre aceptar que el camino era infinito. Cuando salió al otro lado, su armadura no tenía arañazos, pero sus ojos reflejaban una certeza nueva: no tenía miedo a perderse, porque perderse era parte del mapa.`,
  },
  {
    id: 'la-maldicion-del-yelmo',
    title: 'El Yelmo Cantarín',
    journey: 8,
    content: `Todo comenzó cuando el aventurero encontró un cofre brillante en las mazmorras del Castillo Olvidado. Esperaba oro, quizás una espada rúnica. En su lugar, halló un yelmo de hierro oxidado que prometía "sabiduría infinita" en su inscripción. Confiado, se lo colocó.

El yelmo no otorgaba sabiduría. Otorgaba un repertorio inagotable de canciones de taberna desafinadas, y se negaba a quedarse callado.

Caminar por el bosque se volvió una tortura. El aventurero intentaba acechar a un grupo de bandidos, y el yelmo comenzaba a tararear una balada sobre un pato que quería ser rey. ¡Cua, cua, cua! sonaba el metal con eco, alertando a media legua a la redonda. Los bandidos no lo atacaron; se rieron tanto que uno se cayó de un árbol. El aventurero, rojo de furia bajo el hierro, tuvo que sentarse a esperar a que terminaran los aplausos del yelmo antes de poder hablar.

Intentó quitárselo, pero el metal estaba pegado a su cabeza mediante magia bromista. Durante tres días, el aventurero vivió una vida de música no deseada. Pero la cosa cambió cuando se encontró con un Troll de puente, un ser enorme y gruñón que demandaba un tributo. El aventurero no tenía monedas. El yelmo, en un acto de "genio", rompió a cantar una ópera épicamente mala.

El Troll, aturdido por el vibrato metálico y la letra absurda, gritó: "¡Basta! ¡Lárgate! ¡Te pago tú para que te vayas!". El aventurero salió de allí con una bolsa de gemas y el yelmo finalmente se soltó, satisfecho, para caer al río. Aprendió una lección valiosa: a veces, la vergüenza es el arma más poderosa, y nunca, jamás, confíes en un casco que tararea.`,
  },
  {
    id: 'la-moneda-del-mendigo',
    title: 'Justicia de Cobre',
    journey: 9,
    content: `Llovía sobre la ciudad de Oakhaven, una lluvia gris que limpiaba las piedras y el alma. El aventurero caminaba por el distrito bajo, con la bolsa llena de monedas tras un trabajo bien hecho. En un rincón, un mendigo extendió una mano temblorosa. No pedía comida, ni oro. Pedía justicia.

El mendigo le explicó que un comerciante corrupto le había quitado su tienda con trampas legales. Le tendió una moneda de cobre, la última que le quedaba. "Es todo lo que tengo para pagarte. Necesito que recuperes mis escrituras".

El aventurero sabía que el comerciante era peligroso y tenía guardias. Por una moneda de cobre, no valía la pena el riesgo. Podría haber ignorado al viejo. Podría haberle dado una moneda de oro y seguir su camino. Pero miró el cobre, pesado y frío en su mano. Tenía que tomar una decisión: ser un mercenario para el mejor postor, o ser un caballero para quien no tenía nada.

Esa noche, el aventurero no entró a robar las escrituras. Entró para asustar al comerciante, utilizando su reputación y unas cuantas sombras bien colocadas para convencerlo de que devolver lo robado era mejor que perder la paz. Al día siguiente, el mendigo recuperó su tienda. No hubo gloria, ni canciones, ni puntos de experiencia. Solo la sensación de haber hecho lo correcto cuando nadie miraba. El aventurero guardó la moneda de cobre en su bota, recordando que el valor de un hombre no se mide por lo que gana, sino por lo que elige proteger.`,
  },
  {
    id: 'cenizas-torre-marfil',
    title: 'La Torre Vacía',
    journey: 10,
    content: `El viento aullaba alrededor de la Torre de Marfil, el lugar donde se decía que los magos guardaban los recuerdos del mundo. El aventurero subió los mil escalones con una carta en el pecho, una carta escrita hace años que nunca pudo enviar. Buscaba al Guardián del Tiempo, un ser capaz de retroceder un día, solo uno, para despedirse de su hermano caído en batalla.

Cuando llegó a la cima, la sala estaba vacía, excepto por un espejo roto y polvo en el suelo. El Guardián había muerto hacía siglos. No había magia que reparar el pasado. El aventurero se dejó caer sobre las losas frías. Toda la constancia, todo el entrenamiento, todo el "no rendirse" le había llevado a una habitación vacía.

Se quedó allí, viendo cómo el atardecer teñía el cielo de rojo sangre. Sintió el peso de la armadura, la fatiga en los huesos. Sacó la carta y, por primera vez en años, lloró. No fue un llanto de debilidad, sino de liberación. Dejó que el viento se llevara el papel, que se quemó al contacto con la magia residual de la torre.

Entendió, mientras bajaba la torre, que no todas las misiones tienen un final feliz. A veces, la verdadera aventura es aprender a cargar con el vacío y seguir caminando. No obtuvo el tiempo que deseaba, pero obtuvo la paz de aceptar que lo perdido se queda en el ayer, y que el único momento viable es el siguiente paso.`,
  },
  {
    id: 'el-veneno-de-la-hospitalidad',
    title: 'El Veneno de la Hospitalidad',
    journey: 16,
    content: `Llegaste a la aldea de Valleclaro con el escudo partido y una fiebre que te hacía ver sombras donde no las había. Te despertaste en una cama que olía a lavanda y pan recién horneado. Una mujer de manos cálidas te ponía paños fríos en la frente, mientras un hombre mayor, de barba canosa y ojos cansados, afilaba tu espada con una piedra de río. "Aquí estás a salvo, viajero", te dijeron. Y, por primera vez en muchos meses, te permitiste creerlo.

Durante una semana, fuiste uno más en la mesa de aquella familia. Ayudaste al padre a reforzar la empalizada y jugaste con los niños, enseñándoles trucos con monedas. Te contaron que Valleclaro era un lugar olvidado por los dioses, acosado por un señor de la guerra que exigía tributos imposibles. Tú, henchido por la gratitud y la recuperación de tus fuerzas, les prometiste que los defenderías. Les mostraste tus logros, tus medallas de misiones pasadas, y viste en sus ojos una mezcla de asombro y algo más que no supiste identificar.

La última noche, prepararon un banquete. No era mucho —un guiso de raíces y un poco de sidra—, pero el ambiente era de celebración. El padre te brindando un cuenco de madera tallada a mano. "Para que el camino te sea leve", dijo con una voz que tembló apenas un instante. Bebiste. La sidra era dulce, con un regusto metálico que atribuiste a las hierbas locales.

Poco después, tus párpados empezaban a pesar toneladas. Intentaste levantarte, pero tus piernas eran de gelatina. Viste al hombre, aquel que habías empezado a ver como a un padre, evitar tu mirada. Escuchaste el galope de caballos acercándose. No eran bandidos, eran los hombres del señor de la guerra. El hombre se acercó a ti mientras te derrumbabas en el suelo. "Lo siento", susurró, y viste lágrimas reales en sus ojos. "Él prometió no llevarse a mi hijo mayor si le entregábamos a alguien valioso. Alguien con tu XP, con tu equipo... tú vales diez años de nuestros tributos".

Mientras los soldados te arrastraban hacia el exterior, amarrado como una bestia de carga, viste a la familia recoger la mesa en silencio. No había odio en sus rostros, solo la fría y devastadora resignación de los que sacrifican a un extraño para salvar lo que aman. Te diste cuenta de que el engaño más cruel no nace de la maldad, sino de la desesperación. Te habías convertido en la moneda de cambio de una paz que tú mismo habías prometido traer, pero de la forma más amarga posible.`,
  },
  {
    id: 'el-refugio-de-la-tormenta',
    title: 'El Refugio de la Tormenta',
    journey: 17,
    content: `La lluvia en las Tierras Altas no cae, se clava. Es una cortina de agujas frías que reduce el mundo a un palmo de distancia. Llevabas horas con las botas hundiéndose en el fango cuando divisaste la silueta de la Torre de la Vigilia, una muela de piedra negra que sobrevivía a duras penas en la cima de un risco. Al entrar, el olor a humedad y piedra vieja te golpeó, pero fue el chisporroteo de una hoguera lo que te puso en alerta.

Allí estaba ella. No era una damisela esperando rescate, sino una exploradora con el rostro marcado por el viento y las manos curtidas de manejar el sextante. Sus mapas, extendidos sobre una piedra plana, eran obras de arte de tinta y sudor. Al principio, el silencio fue vuestro único idioma; dos extraños midiendo sus sombras. Pero el frío es un gran igualador. Compartiste tu ración de carne seca; ella, una bota de vino de palma que quemaba la garganta y encendía el ánimo.

Pasasteis la noche alimentando el fuego con maderas podridas que encontrasteis en las esquinas. Hablasteis de lo que significa estar siempre de paso. Ella te contó que buscaba una isla que solo aparecía cuando la luna se teñía de rojo; tú le hablaste de tu necesidad de subir niveles, de ser más fuerte, de no fallar en tus misiones diarias. En un momento dado, la conversación murió y solo quedó el sonido del viento aullando fuera. Bajo la luz vacilante de las brasas, su mirada se encontró con la tuya. Hubo una vibración en el aire, esa certeza eléctrica de que, en otras circunstancias —sin una guerra que ganar, sin una lista de tareas que completar, sin ese hambre de gloria que te empuja a caminar—, ella habría sido la persona por la que habrías dejado de ser un nómada.

Sentiste el impulso de pedirle que se quedara, o de ofrecerte a seguir sus mapas. Sus dedos rozaron los tuyos mientras alcanzaba una manta, y por un segundo, el universo se redujo a ese contacto. Pero ambos sabíais que era un espejismo. Al amanecer, el cielo lucía un azul herido. Ella recogió sus pergaminos con movimientos precisos. Te dio un beso rápido en la mejilla, un contacto que sabía a sal y a despedida. Se marchó hacia el este, convirtiéndose en un punto en el horizonte. Caminaste el resto del día con una extraña pesadez en el pecho, entendiendo que el viaje más difícil no es el que te lleva lejos, sino el que te obliga a dejar atrás lo que nunca llegaste a poseer.`,
  },
  {
    id: 'la-biblioteca-de-las-cenizas',
    title: 'La Biblioteca de las Cenizas',
    journey: 18,
    content: `En el corazón del Desierto Blanco, donde el calor distorsiona la realidad, se alza la Torre de Silencio. Allí reside el Archivista, un monje ciego que custodia la biblioteca más vasta que jamás hayas imaginado. Cuando entraste, esperando encontrar tomos de magia o mapas de tesoros, te quedaste paralizado: las estanterías estaban llenas de hojas de papel tan finas que parecían feitas de aire. El Archivista escribía con una pluma de cristal, trazando caracteres de una belleza dolorosa.

"¿Qué historia es esa?", preguntaste, acercándote a la mesa. El monje sonrió. "Es la tuya. Cada hábito que completas, cada racha que mantienes, cada vez que caes y te levantas. Todo se registra aquí". Te sentiste orgulloso por un momento, viendo el volumen de tu propia vida. Pero entonces, viste algo aterrador. Una vela encendida en la corner de la mesa no iluminaba; su llama consumía las hojas ya escritas a un ritmo constante. A medida que el monje terminaba un párrafo, el inicio del capítulo se convertía en ceniza gris que el viento se llevaba por la ventana.

"¡Para!", gritaste. "¡Estás perdiendo todo el progreso!". El Archivista dejó de escribir, pero no pareció preocupado. "Hijo mío, la ilusión del viajero es creer que el camino se acumula debajo de sus pies como un tesoro. Pero el tiempo no es un cofre, es un río. Si lo que escribo no se quemara, mi mano se volvería perezosa. Si supieras que tus logros son eternos, dejarías de esforzarte hoy, confiando en la gloria de ayer".

Te explicó que la biblioteca no servía para guardar conocimiento, sino para practicar el acto de crear. El valor de tu disciplina, de tus misiones y de tus niveles no residía en el número final, sino en el incendio constante de tu voluntad. "Cuando termines tu viaje", dijo el monje mientras una página de tu infancia se desintegraba en el aire, "no quedará ni un solo libro. Solo quedará el hombre en el que te convertiste mientras los escribías".

Saliste de la torre bajo un cielo estrellado, mirando tus manos. Por primera vez, entendiste que tu "personaje" no era el conjunto de ítems en tu inventario o los puntos en tu barra de nivel, sino la llama que seguía ardiendo a pesar de saber que, al final del día, el viento siempre se lleva las cenizas. El viaje no era hacia una meta, era el incendio mismo.`,
  },
  {
    id: 'la-bibliotecaria-de-los-suenos',
    title: 'La Bibliotecaria de los Sueños',
    journey: 19,
    content: `Llegaste a la Gran Biblioteca de Aethelgard no buscando una espada, sino una respuesta. Las crónicas decían que en sus niveles inferiores, donde el aire huele a pergamino viejo y a tiempo estancado, se encontraba el Códice de las Voluntades, un libro que explicaba por qué algunos hombres persiguen metas que los destruyen mientras otros se rinden antes de empezar. Fue allí, entre estanterías que rascaban el techo de piedra, donde la conociste.

Ella no levantó la vista de su escritorio cuando entraste. Estaba rodeada de tinteros y plumas de fénix, transcribiendo textos que parecían danzar bajo la luz de su lámpara de aceite. "El tercer estante a la izquierda tiene lo que buscas", dijo sin mirarte, "pero dudo que estés preparado para leerlo". Su voz tenía la cadencia de alguien que ha pasado más tiempo conversando con los muertos que con los vivos.

Pasaste tres días en la biblioteca. Lo que empezó como una búsqueda de información se convirtió en una danza de intelectos. Ella no solo conocía los libros; entendía el hambre que te empujaba a seguir tu "quest". Compartisteis cenas frugales de queso seco y manzanas sobre mapas de constelaciones desaparecidas. Ella terminó tus frases sobre la naturaleza del sacrificio; tú le explicaste cómo se siente el acero frío contra la palma de la mano cuando el miedo te susurra que vuelvas a casa. Por primera vez en tu viaje, no tuviste que explicar por qué hacías lo que hacías. Ella lo veía en la forma en que sostenías la pluma, en la cicatriz de tu antebrazo, en la fatiga de tus ojos.

Hubo una noche, mientras la lluvia golpeaba las vidrieras altas de la biblioteca, en que el silencio se volvió denso. Ella dejó su pluma y te miró. En ese instante, supiste que habías encontrado a tu igual. No era un amor de canciones de taberna, era algo más profundo: el reconocimiento de dos chispas que arden con la misma intensidad en un universo oscuro. Podrías haberte quedado allí, ayudándola a catalogar el infinito, olvidando las misiones, los niveles y el sudor del camino. Podríais haber sido los guardianes de toda la sabiduría del mundo, envejeciendo entre susurros de papel.

"No puedes quedarte", dijo ella, adivinando tu pensamiento antes de que lo pronunciaras. Sus ojos brillaban con una tristeza antigua. "Yo estoy atada a este lugar por un voto de silencio y custodia. Y tú... tú eres un motor que solo sabe avanzar. Si te quedas, el fuego que te hace ser tú se apagará, y terminarás odiando el olor de estos libros".

Te entregó una pequeña cinta de seda negra para marcar tu progreso. "Vete ahora, antes de que el sol nos convenza de cometer una locura". Te fuiste al amanecer, con el corazón apretado por una verdad universal: a veces encuentras a la persona perfecta en el único momento en que no puedes permitirte detenerte. Caminaste durante leguas sin mirar atrás, sintiendo que una parte de tu alma se había quedado para siempre archivada en la sección de "historias no escritas" de Aethelgard.`,
  },
  {
    id: 'la-dama-de-los-escudos',
    title: 'La Dama de los Escudos',
    journey: 21,
    content: `La conociste en los Pantanos Negros, un lugar donde el gas púrpura te hace dudar de tus propios sentidos. Ella apareció de entre la bruma justo cuando un grupo de acechadores te tenía acorralado. Su técnica con el escudo era impecable; se movía con una gracia que solo da una vida dedicada a la guerra. Juntos, despachasteis a las criaturas en una coreografía de acero y sangre que te hizo creer, por un instante, en el destino.

"Parece que el camino es demasiado peligroso para un lobo solitario", te dijo mientras limpiaba su daga en un trozo de musgo. Se presentó como Elara, una renegada que buscaba lo mismo que tú: trascender, subir de nivel, dejar de ser una sombra en el mundo. Durante las semanas siguientes, se convirtió en tu sombra. Ella montaba la guardia mientras tú dormías; ella conocía las hierbas que calmaban tus heridas. Empezaste a compartir con ella no solo tu comida, sino tus planes más ambiciosos. Le enseñaste tu inventario, le hablaste de ese objeto legendario que guardabas para la batalla final, y le confesaste tus debilidades, aquellas que no figura en ninguna hoja de personaje.

Llegasteis a confiar el uno en el otro de una forma que solo los que comparten el peligro pueden entender. Una noche, junto a una hoguera en las ruinas de un anfiteatro, ella te habló de sus sueños, de cómo quería usar su poder para proteger a los débiles. Te sentiste inspirado, casi avergonzado de tus propios deseos egoístas de gloria. Le entregaste la llave de tu cofre de suministros para que ella gestionara las raciones. "Somos un equipo ahora", dijiste. Ella sonrió, y fue una sonrisa hermosa, llena de una calidez que te hizo bajar la guardia por completo.

Esa noche, el sueño fue inusualmente pesado. Te despertaste con el sol dándote en la cara, algo extraño, pues Elara siempre te despertaba antes del alba. El campamento estaba en silencio. Buscaste tu escudo, pero no estaba. Buscaste tu bolsa de gemas, pero solo encontraste piedras comunes. El cofre de suministros estaba abierto y vacío. Pero lo que realmente te detuvo el corazón fue ver que tu amuleto de "Escudo de Almas", el objeto que habías tardado tres viajes en conseguir, ya no colgaba de tu cuello.

En el centro del campamento, clavada en la tierra con tu propia daga de repuesto, había una nota: "Gracias por el equipo. Has sido un maestro excelente, pero tu mayor debilidad es creer que la gratitud es una moneda de cambio en este mundo. Me has ahorrado meses de esfuerzo. No me busques; para cuando leas esto, habré vendido tus logros y estaré en otra provincia, siendo la heroína que tú aspirabas a ser".

Te quedaste allí, rodeado de las cenizas frías de la hoguera, sintiendo el vacío en el pecho. No era solo el equipo perdido; era la comprensión de que cada palabra de aliento, cada mirada de admiración y cada gesto de ayuda habían sido cuidadosamente calculados para despojarte de todo. Habías sido un escalón en su ascenso, un recurso más en su inventario. El mundo se sintió mucho más frío ese día, no porque tuvieras menos oro, sino porque aprendiste que el monstruo más peligroso no es el que te ataca de frente, sino el que camina a tu lado y te llama "amigo".`,
  },
  {
    id: 'el-peso-del-lastre',
    title: 'El Peso del Lastre',
    journey: 22,
    content: `Sucedió en el Paso de los Lamentos, una grieta estrecha entre dos montañas de granito que parecen querer aplastar el cielo. Te acompañaba Kaelen, un joven escudero que habías contratado en la última aldea. No era un guerrero, pero sus manos eran rápidas con las correas y su optimismo era el único fuego que te mantenía caliente en las noches de ventisca. Sin embargo, la montaña no entiende de entusiasmos.

Un alud de piedras sueltas os sorprendió al cruzar un saliente de apenas medio metro de ancho. Kaelen no cayó al abismo, pero su pierna quedó atrapada bajo una roca del tamaño de un altar. El crujido del hueso rompiéndose fue más fuerte que el trueno que azotaba la cima. Lo intentaste todo. Usaste tu espada como palanca hasta que el acero empezó a curvarse; usaste tus cuerdas hasta que tus manos sangraron por la fricción. Pero la roca no cedía. Y entonces, los escuchaste: los aulladores de las cumbres. Sombras famélicas que huelen el miedo y la sangre a kilómetros de distancia.

"Vete", susurró Kaelen. Su rostro estaba blanco como la nieve, pero sus ojos estaban fijos en los tuyos. Tenías dos opciones: quedarte y morir defendiendo un cuerpo que ya no podía caminar, o correr y dejar que la montaña terminara su trabajo. Los aullidos estaban a menos de cien metros. Sentiste el frío de la lógica golpeándote el pecho: si morías allí, todas tus misiones anteriores, todo tu progreso, todo el mapa que habías trazado, desaparecería con tu último aliento.

No hubo una despedida heroica. Simplemente te pusiste en pie, ajustaste tu mochila y empezaste a subir por la pendiente, evitando mirar atrás. Los gritos de Kaelen no fueron de odio, sino de un terror puro que se cortó en seco cuando las sombras llegaron a él. Caminaste durante dos días sin detenerte, con las piernas temblando no por el esfuerzo, sino por la ligereza de haber dejado atrás tu humanidad para salvar tu pellejo. Al llegar al otro lado del paso, el sol brillaba, pero tú sentías que una parte de tu sombra se había quedado encadenada a aquella roca para siempre.`,
  },
  {
    id: 'el-filo-del-error',
    title: 'El Filo del Error',
    journey: 23,
    content: `La niebla en el Bosque de los Susurros no es vapor de agua; es una entidad que distorsiona los sonidos y te susurra tus propios miedos al oído. Llevabas tres noches sin dormir, con la mano pegada al pomo de la espada, perseguido por los "Cazadores de Pieles", asesinos silenciosos que visten las caras de sus víctimas. El agotamiento te había convertido en un animal herido, reactivo a cualquier movimiento de las hojas.

Viste una silueta moviéndose entre los robles milenarios. No emitía sonido, pero llevaba algo brillante en la mano: el reflejo del acero, pensaste. Tu instinto, forjado en mil batallas y subida de nivel, tomó el control antes que tu razón. No hubo desafío, no hubo preguntas. Te lanzaste desde la cobertura de un tronco y hundiste tu daga en el cuello de la figura con una precisión quirúrgica que habías perfeccionado durante meses.

Mientras el cuerpo caía, la niebla se disipó apenas un segundo. No era un cazador. Era un anciano ciego, el ermitaño de la arboleda del que te habían hablado en la posada, aquel que poseía la única cura para la plaga que asolaba la provincia vecina. Lo que habías creído que era un cuchillo era en realidad un vial de cristal con la esencia de vida que él traía para ti, habiendo salido a buscarte para salvarte de la fiebre del bosque. El vial se hizo añicos contra las raíces, mezclando el líquido dorado con la sangre roja del viejo.

Te quedaste de rodillas, con las manos manchadas de una culpa que ningún hechizo de purificación puede borrar. Habías matado a la única persona que podía dar sentido a tu misión, convirtiéndote en el villano de una historia en la que creías ser el protagonista. Sobreviviste a la noche, sí, pero mientras caminabas hacia la salida del bosque, comprendiste que la muerte de un inocente pesa más que la armadura más pesada de tu inventario. El mundo seguía allí, pero habías asesinado el futuro que estabas intentando salvar.`,
  },
  {
    id: 'el-gambito-del-mendigo',
    title: 'El Gambito del Mendigo',
    journey: 24,
    content: `Te encontrabas en las mazmorras de la Fortaleza de Hierro, despojado de tus armas, de tu armadura y de todos los ítems mágicos que habías acumulado con tanto esfuerzo. Frente a ti, el Alcaide, un gigante que disfrutaba rompiendo la voluntad de los héroes antes de cortarles la cabeza. "Mañana al amanecer", dijo con una sonrisa podrida, "servirás de alimento para las bestias del foso. No hay salida, viajero. Tu historia termina en este agujero mugriento".

Tenías solo una cuchara de madera, un poco de paja húmeda y el recuerdo de una vieja historia que te contó un ladrón en una celda anterior. El Alcaide era supersticioso hasta la médula; creía que la fortuna era una deidad caprichosa que podía ser comprada o engañada. Usando el hollín de una antorcha gastada, dibujaste extraños símbolos en las paredes de la celda y empezaste a susurrar en un idioma inventado, fingiendo una agonía mística.

Cuando el Alcaide vino a buscarte al alba, te encontró en el suelo, aparentemente muerto, con la piel cubierta de manchas negras (carbón mezclado con saliva). "¡La Plaga Gris!", gritaste con un hilo de voz cuando se acercó. "¡El dios de los niveles me ha castigado por mis pecados! Cualquiera que toque mi cuerpo o mis pertenencias antes de que el sol alcance el cenit, se convertirá en ceniza antes del anochecer".

El pánico en sus ojos fue el momento que esperabas. En lugar de ejecutar al prisionero y arriesgarse a una maldición divina, el Alcaide ordenó que te sacaran de la fortaleza en una carreta de basura para quemarte lejos de sus muros. Los guardias, aterrados, te arrojaron a un vertedero a kilómetros de la prisión sin siquiera revisarte. En cuanto se marcharon, te levantaste, te sacudiste el hollín y recuperaste tu equipo, que convenientemente habían dejado en la misma carreta para "purificarlo" con fuego. Habías convertido tu ejecución en un servicio de transporte gratuito. La fuerza te había fallado, pero tu capacidad para leer el miedo de los hombres te había devuelto la vida.`,
  },
  {
    id: 'el-seguro-de-vida-del-nigromante',
    title: 'El Seguro de Vida del Nigromante',
    journey: 25,
    content: `Encontraste a un nigromante en las llanuras de los Huesos, pero no estaba levantando un ejército de esqueletos para conquistar el mundo. Estaba sentado en un escritorio de hueso humano, rodeado de archivistas zombis que gemían mientras sellaban pergaminos con sangre. Se hacía llamar "Mortis, el Gestor de Activos Post Mortem".

"Mira, aventurero", te dijo mientras ajustaba sus gafas de cristal de alma, "matar monstruos es un desperdicio de recursos. Cada vez que matas a un orco, estás destruyendo mano de obra barata. Yo ofrezco un servicio de 'Reciclaje de Héroes'". El plan era sencillo: tú le dabas un 10% de tu oro actual y, si morías en combate, él no te resucitaba (eso es caro y molesto), sino que animaba tu cadáver para que siguiera completando tus hábitos de forma automática.

"Imagínatelo", insistió Mortis con una sonrisa cadavérica. "Tu cuerpo, ya sin el peso de la conciencia o el cansancio, yendo al gimnasio, comiendo brócoli y limpiando la casa por toda la eternidad. Serías el héroe más productivo de la historia, ¡y ni siquiera estarías allí para aburrirte!". Te mostró un folleto donde un esqueleto con una peluca rubia intentaba sonreír mientras levantaba pesas. Cuando le preguntaste qué pasaba con tu alma, Mortis se encogió de hombros: "Oh, el alma es un subproducto innecesario. Probablemente la usemos para alimentar la caldera de la oficina. Es energía limpia, ¿sabes?". Saliste de allí corriendo, dándote cuenta de que en este mundo, a veces es más aterrador un plan de pensiones que una horda de demonios.`,
  },
  {
    id: 'la-balada-del-yelmo-de-cristal',
    title: 'La Balada del Yelmo de Cristal',
    journey: 26,
    content: `Todo empezó con un "solo una jarra" en la Posada del Jabalí Tuerto. Habías completado tu reto diario, tenías el inventario lleno de oro y el multiplicador de racha por las nubes. Te sentías invencible. Cuatro jarras de hidromiel después, convenciste a toda la taberna de que podías derrotar al Cíclope de la Colina usando solo una cuchara y un calcetín sucio como arma.

"¡Es una cuestión de palanca y aerodinámica!", gritabas mientras tropezabas con tu propia capa. La noche es un borrón de risas estruendosas, apuestas imposibles y un intento muy serio de enseñarle a un caballo a cantar baladas de amor. Lo último que recuerdas es haber intercambiado tu Armadura de Placas +5 por lo que el tabernero llamó "El Yelmo de la Invisibilidad Absoluta", que extrañamente se parecía mucho a una ensaladera de cristal con una pegatina de "Oferta".

Despertaste al mediodía siguiente. No estabas en una cama. Estabas en mitad de la plaza del mercado, durmiendo dentro de una fuente pública, luciendo únicamente tus calzoncillos de lana y la ensaladera en la cabeza. Tu oro había desaparecido, tu espada legendaria estaba clavada en un pastel de carne en el puesto de enfrente y, lo peor de todo, tenías una notificación de "Misión Fallida" grabada en tu mente con la fuerza de un martillazo. Tu racha se había reseteado, tu multiplicador era un triste recuerdo y la gente del pueblo te señalaba mientras se preguntaba si el "héroe del reino" siempre había tenido ese tatuaje de un trasgo bailando en el pecho. Fue el final de tu leyenda y el inicio de una resaca que, según los cronistas, duró tres libros y dos expansiones.`,
  },

  // ==================================================================================
  // ACHIEVEMENT STORIES (1:1 MAPPING)
  // ==================================================================================

  // --- PRIMEROS PASOS ---
  {
    id: 'story_first_habit',
    title: 'La Primera Piedra',
    content: `Dicen que la construcción de la catedral más grande comienza moviendo una sola piedra. Hoy has movido la tuya. No parece mucho, una pequeña roca en un campo vasto, pero el suelo bajo tus pies ya se siente más firme. Has roto la inercia, la fuerza más poderosa del universo.`,
  },
  {
    id: 'story_first_habit_added',
    title: 'El Contrato',
    content: `Has escrito tu primera intención en el pergamino del destino. No es tinta lo que sella este pacto, es tu voluntad. Al definir qué quieres hacer, has separado el caos del orden. El universo ahora sabe qué esperas de ti mismo.`,
  },
  {
    id: 'story_three_habits',
    title: 'El Malabarista Novato',
    content: `Uno es casualidad, dos es compañía, tres es multitud... o un sistema. Has empezado a tejer una red de acciones. Como un malabarista que añade más bolas al aire, sientes la tensión y la emoción de mantener el ritmo. No dejes que caigan.`,
  },

  // --- RACHAS ---
  {
    id: 'story_streak_3',
    title: 'La Chispa',
    content: `Tres días. Tres golpes de pedernal. La primera vez fue suerte, la segunda coincidencia, la tercera es una chispa. Un fuego pequeño ha comenzado a arder en tu campamento. Protégelo del viento.`,
  },
  {
    id: 'story_streak_7',
    title: 'El Ritmo del Tambor',
    content: `Una semana completa. Tu cuerpo y tu mente empiezan a anticipar la tarea antes de que ocurra. Es como el redoble lejano de un tambor de guerra; te llama a la acción y tus músculos responden por instinto. La disciplina está dejando de ser una obligación para ser un ritmo.`,
  },
  {
    id: 'story_streak_14',
    title: 'La Forja del Hábito',
    content: `Dos semanas. El metal al rojo vivo empieza a tomar forma bajo el martillo. Lo que antes requiriosa esfuerzo consciente, ahora fluye con cierta naturalidad. Estás forjando una herramienta que te servirá el resto de tu vida.`,
  },
  {
    id: 'story_streak_30',
    title: 'La Nueva Piel',
    content: `Un mes. Dicen que la luna tarda este tiempo en mostrar todas sus caras. Tú has mostrado constancia en todas las tuyas. Este hábito ya no es algo que "haces", es parte de quien "eres". Se ha convertido en una nueva capa de piel, resistente y propia.`,
  },
  {
    id: 'story_streak_60',
    title: 'La Estación del Cambio',
    content: `Dos meses. Las estaciones cambian, las hojas caen, pero tú sigues ahí. Has demostrado que tu voluntad es más fuerte que el clima o el estado de ánimo. Eres una roca en medio del río del tiempo.`,
  },
  {
    id: 'story_streak_100',
    title: 'El Centurión de Hierro',
    content: `Cien días. En las antiguas legiones, un centurión comandaba a cien hombres. Tú has comandado a cien versiones de ti mismo: al que estaba cansado, al que estaba triste, al que quería rendirse. Y has vencido a todos. Eres el general de tu propia alma.`,
  },
  {
    id: 'story_streak_100_inv',
    title: 'La Leyenda Viviente',
    content: `Cien días sin fallo. Eres una anomalía estadística. La mayoría se rinde al día diez. Tú has convertido la excepción en norma. Los bardos deberían cantar sobre esto, pero estás demasiado ocupado cumpliendo para escucharlos.`,
  },

  // --- TODOS LOS HÁBITOS ---
  {
    id: 'story_all_day',
    title: 'El Día Perfecto',
    content: `Hoy, los astros se alinearon... porque tú los empujaste. Has cumplido todo lo propuesto. Al irte a dormir, no hay "debería haber hecho" rondando tu cabeza. El silencio de una conciencia tranquila es la mejor almohada.`,
  },
  {
    id: 'story_all_week',
    title: 'La Semana Dorada',
    content: `Siete días de perfección absoluta. Eres como el rey Midas, pero en lugar de oro, conviertes el tiempo en progreso. Has vivido una semana que muchos desearían, no por suerte, sino por pura determinación.`,
  },
  {
    id: 'story_all_month',
    title: 'El Mes de los Milagros',
    content: `Treinta días sin dejar caer ni una sola pelota. Has alcanzado un estado de flujo que los monjes envidiarían. Tu vida es una máquina perfectamente engrasada. Disfruta de la vista desde la cima de tu propia disciplina.`,
  },
  {
    id: 'story_all_x2',
    title: 'Sincronía Armónica',
    content: `Todos tus hábitos vibran al unísono. No hay eslabones débiles en tu cadena. Has elevado el estándar de toda tu vida, no solo de una parte. Eres una orquesta tocando una sinfonía perfecta.`,
  },
  {
    id: 'story_all_max',
    title: 'La Obra Maestra',
    content: `Cinco hábitos al máximo potencial. Esto ya no es disciplina, es arte. Has esculpido tu rutina con tal maestría que inspira a quienes te observan. Eres el Miguel Ángel de la productividad.`,
  },

  // --- MULTIPLICADORES ---
  {
    id: 'story_mult_2',
    title: 'El Impulso',
    content: `Has doblado tu eficacia. Ya no caminas, corres. El viento te da en la cara y el paisaje pasa más rápido. Has descubierto que el esfuerzo constante genera su propia gravedad.`,
  },
  {
    id: 'story_mult_3',
    title: 'Velocidad de Escape',
    content: `Triple rendimiento. Estás rompiendo la atmósfera de la mediocridad. La gravedad de los viejos vicios ya no te afecta tanto. Estás en órbita, viendo tus problemas desde arriba, pequeños e insignificantes.`,
  },
  {
    id: 'story_multiplier_3_max',
    title: 'La Singularidad',
    content: `Has alcanzado el límite teórico de velocidad en un hábito. Eres luz pura. Nada te detiene. Has optimizado tanto este aspecto de tu vida que parece magia para los no iniciados.`,
  },
  {
    id: 'story_mult_5',
    title: 'Ascensión Divina',
    content: `X5.0. Esto no debería ser posible. Estás operando en un plano de existencia superior. Los mortales hacen tareas; tú alteras la realidad con tu voluntad.`,
  },

  // --- VIAJES (Achievements for reaching levels) ---
  {
    id: 'story_level_1',
    title: 'El Primer Paso del Héroe',
    content: `Has completado el primer viaje. Ya no eres un aldeano común. Tienes polvo en las botas y una historia en la mirada. El mundo es más grande de lo que pensabas, y tú también.`,
  },
  {
    id: 'story_level_2',
    title: 'El Mapa se Expande',
    content: `Nivel 2. Las fronteras conocidas se quedan atrás. Has visto cosas que no podrías explicar a tus viejos amigos. La comodidad del hogar ha sido reemplazada por la emoción del horizonte.`,
  },
  {
    id: 'story_level_3',
    title: 'El Veterano de Caminos',
    content: `Nivel 3. Ya sabes qué bayas comer y cuáles matan. Sabes leer el cielo antes de la tormenta. El camino ya no es un enemigo, es un maestro severo pero justo.`,
  },
  {
    id: 'story_level_5',
    title: 'Leyenda Local',
    content: `Nivel 5. En las tabernas empiezan a susurrar tu nombre. "Ahí va quien cruzó el Valle de las Sombras". No buscas fama, pero tus cicatrices cuentan historias de valor.`,
  },
  {
    id: 'story_level_10',
    title: 'El Maestro del Gremio',
    content: `Nivel 10. Podrías retirarte y enseñar, pero el camino aún te llama. Eres una autoridad en el arte de avanzar. Los novatos te miran con asombro; tú los miras con nostalgia.`,
  },
  {
    id: 'story_level_20',
    title: 'El Mito Viviente',
    content: `Nivel 20. ¿Eres real? Algunos dicen que eres un espíritu del bosque, una fuerza de la naturaleza. Has trascendido la aventura para convertirte en parte del folclore del mundo.`,
  },

  // --- COLECCIONISTA & OBJETOS ---
  {
    id: 'story_collect_5',
    title: 'La Mochila Pesada',
    content: `Cinco objetos. Tu inventario empieza a parecer el de un verdadero aventurero: cuerdas, pociones, talismanes extraños. Cada objeto tiene un "por si acaso" detrás. Estás preparado.`,
  },
  {
    id: 'story_object_master',
    title: 'El Alquimista Práctico',
    content: `No solo guardas objetos, los usas. Has aprendido que una herramienta en la mochila no sirve de nada; su valor está en la mano. Eres ingenioso y adaptable.`,
  },

  // --- PUNTOS ---
  {
    id: 'story_points_1000',
    title: 'El Primer Millar',
    content: `Mil puntos de experiencia vital. Cada punto es una lección, un error corregido, un acierto celebrado. Si pudieras pesar tu sabiduría, la balanza ya se inclinaría.`,
  },
  {
    id: 'story_points_10000',
    title: 'La Biblioteca de Vivencias',
    content: `Diez mil puntos. Si cada punto fuera una página, habrías escrito una enciclopedia. Tu vida es rica en contenido, densa en significado.`,
  },
  {
    id: 'story_points_day',
    title: 'La Tormenta Perfecta',
    content: `Cien puntos en un día. Fuiste un huracán de productividad. Arrasaste con tus listas de tareas. Hoy no caminaste, volaste.`,
  },
  {
    id: 'story_points_week',
    title: 'La Cosecha Abundante',
    content: `Quinientos puntos en una semana. Como un granjero diligente, has recogido los frutos de tu esfuerzo masivo. Tus graneros están llenos de logros.`,
  },

  // --- CANTIDAD DE HÁBITOS & COMPLETACIONES ---
  {
    id: 'story_habits_10',
    title: 'El General de Diez Frentes',
    content: `Diez hábitos activos. Mantienes diez platos girando a la vez. Requiere una mente aguda y reflejos rápidos. Estás gestionando una vida compleja con la gracia de un director de orquesta.`,
  },
  {
    id: 'story_completions_100',
    title: 'Cien Victorias Pequeñas',
    content: `Cien veces has dicho "hecho". Cien veces has ganado a la pereza. Es la acumulación de estas pequeñas victorias lo que gana la guerra.`,
  },
  {
    id: 'story_completions_500',
    title: 'El Batallón de Uno',
    content: `Quinientas completaciones. Eres un ejército de un solo hombre/mujer. Tu capacidad de ejecución es temible.`,
  },
  {
    id: 'story_completions_1000',
    title: 'El Milagro de la Constancia',
    content: `Mil veces sí. Mil veces acción. Has construido una montaña grano a grano. Miras atrás y apenas puedes creer la magnitud de lo que has construido con simples "sí, lo haré".`,
  },

  // --- FALLOS Y RECUPERACIONES ---
  {
    id: 'story_streak_broken_5',
    title: 'La Piedra en el Camino',
    content: `Ibas bien, y tropezaste. Duele. El orgullo escuece más que la rodilla. Pero mira bien: sigues en el camino. Caerse no es salir del mapa, es parte de explorarlo. Levántate.`,
  },
  {
    id: 'story_streak_failed_5',
    title: 'El Pozo Oscuro',
    content: `Cinco días de caída. Está oscuro aquí abajo. Hace frío. Es fácil quedarse y decir "no sirvo para esto". Pero recuerda: la única diferencia entre una tumba y un túnel es que tú sigues cavando hacia la salida. Sigue cavando.`,
  },
  {
    id: 'story_no_miss_30',
    title: 'El Autómata de Oro',
    content: `Treinta días sin fallar NADA. ¿Tienes sangre o aceite en las venas? Tu fiabilidad es legendaria. Eres el reloj por el que otros ajustan su tiempo.`,
  },

  // --- EXTRAS ---
  {
    id: 'story_early_achiever',
    title: 'El Coleccionista de Medallas',
    content: `Cinco logros desbloqueados. Te gusta el brillo del reconocimiento, ¿verdad? Y haces bien. Celebrar tus hitos es la gasolina para el siguiente tramo del viaje.`,
  },
  {
    id: 'story_speed_runner_5',
    title: 'El Corredor del Viento',
    content: `Cinco días siendo más rápido que tu propia sombra. La eficiencia es tu espada. Cortas el tiempo sobrante y te quedas con la esencia.`,
  },
  {
    id: 'story_overachiever_5',
    title: 'El Que Da el Extra',
    content: `No te conformas con "suficiente". Das más. Cinco días superando expectativas. Esa milla extra es solitaria, porque pocos llegan a ella, pero la vista es espectacular.`,
  },
];

// --- Helper Functions ---

/**
 * Returns a story by its ID.
 */
export function getStoryById(storyId) {
  return STORIES.find(s => s.id === storyId) ?? null;
}

/**
 * Returns the story for a specific journey number.
 */
export function assignStoryForJourney(journeyNumber, unlockedStories = []) {
  // Try to find a specific story for this journey
  const story = STORIES.find(s => s.journey === journeyNumber);

  if (story) return story;

  // Fallback: if no specific story exists for this journey number, 
  // maybe return a generic high-level one or null? 
  // For now, let's return null to avoid repeating stories inappropriately.
  return null;
}

// Deprecated functions kept for compatibility if needed, but returning null 
// or acting as pass-throughs since random assignment is removed for achievements.
export function assignStoryForEpicAchievement(unlockedStories = []) { return null; }
export function assignStoryForLegendaryAchievement(unlockedStories = []) { return null; }
