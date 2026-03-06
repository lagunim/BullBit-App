/**
 * stories.js — Historias desbloqueables al completar viajes.
 *
 * La primera historia (journey: 1) siempre es 'el-despertar-del-camino'.
 * El resto (journey: null) se asignan aleatoriamente según el progreso del usuario.
 */

export const STORIES = [
  {
    id: 'el-despertar-del-camino',
    title: 'El Despertar del Camino',
    journey: 1, // Siempre el primer viaje
    content: `El sol apenas lograba perforar la niebla de los Bosques Susurrantes cuando ajustaste las correas de tu mochila. No había bandas de música ni multitudes despidiéndote en la puerta de la aldea; solo el eco de tus propios pasos sobre la tierra húmeda. Durante los primeros días de este viaje, el silencio fue tu único compañero. La duda es un monstruo más pesado que cualquier armadura: ¿realmente eras capaz de cruzar la Gran Brecha?

Al tercer día, encontraste un carro volcado. No había señales de lucha, solo una rueda rota y un rastro de manzanas esparcidas. Siguiendo el rastro, hallaste a un viejo cartógrafo atrapado bajo un fardo de suministros. "El mundo no espera a los que se quedan sentados", gruñó mientras lo ayudabas a levantarse. A cambio de tu fuerza, te entregó un mapa de cuero curtido. No era un mapa de tesoros, sino de rutas olvidadas. Al despedirse, te miró a los ojos: "La aventura no es llegar al final, muchacho, es no dar media vuelta cuando las botas empiezan a pesar".

Esa noche, mientras acampabas bajo un cielo estrellado que nunca habías visto desde tu ventana, comprendiste que el mapa estaba en blanco en muchas zonas. Esas zonas eran tuyas para escribirlas. El viaje había comenzado de verdad.`,
  },
  {
    id: 'la-posada-de-los-suspiros',
    title: 'La Posada de los Suspiros',
    journey: null,
    content: `Llegaste a la ciudad fronteriza de Oakhaven con barro hasta las rodillas y un hambre que podría haber devorado un dragón pequeño. Buscando refugio, entraste en "La Posada del Trasgo Ciego". Lo que esperabas que fuera una cena tranquila se convirtió en el caos más absoluto. Un bardo semi-elfo, claramente bajo los efectos de demasiada sidra de manzana, intentaba convencer a un grupo de mercenarios de que él había inventado la gravedad.

"¡Si no fuera por mi balada de 1412, todos estaríamos flotando en el techo!", gritaba mientras intentaba, sin éxito, mantenerse en pie. Te viste arrastrado a una competición de pulsos contra una mujer orco llamada Grogda, cuya risa hacía vibrar las vigas del techo. No ganaste (nadie le gana a Grogda), pero tu honestidad al admitir la derrota te valió una jarra de hidromiel por cuenta de la casa y una historia sobre cómo los orcos consideran que perder con gracia es más honorable que ganar con trampas.

Pasaste la noche riendo, compartiendo anécdotas de tus hábitos —esas "misiones" que te habías autoimpuesto— y descubriendo que, a veces, el mayor peligro de un aventurero no es una espada, sino un bardo con exceso de confianza y una taberna llena de gente con ganas de fiesta. Saliste de Oakhaven con menos monedas, pero con el espíritu mucho más ligero.`,
  },
  {
    id: 'el-guardian-de-la-ruina',
    title: 'El Guardián de la Ruina',
    journey: null,
    content: `En lo profundo del Cañón de las Sombras, encontraste la entrada a un templo que el tiempo había decidido olvidar. Las paredes estaban cubiertas de inscripciones que hablaban de un rey que quiso detener el tiempo para que su reino no pereciera. En el centro de la cámara principal, sobre un altar de mármol negro, descansaba un amuleto que brillaba con una luz pulsante. Era hermoso, y sentiste una vibración en tu pecho: aquel objeto te daría poder, facilitaría tus pasos, borraría el cansancio de tus piernas.

Sin embargo, a la salida te esperaba un niño. No, no era un niño; era un espíritu guardián, con ojos que contenían siglos de cansancio. "Si te llevas el amuleto", dijo con una voz que sonaba como el crujir de hojas secas, "la memoria de este lugar se desvanecerá. El poder que obtengas vendrá del olvido de los que sufrieron aquí". Tuviste que elegir. El camino por delante era largo y aquel objeto era una ventaja legítima.

Miraste tus manos, callosas por el viaje, y luego al espíritu. Entendiste que el verdadero progreso no se roba, se construye. Dejaste el amuleto en el altar. Al salir del templo, el espíritu no te dio oro ni magia, pero el aire del cañón se sintió, por primera vez, cálido y acogedor. Habías ganado algo que ningún objeto puede dar: la certeza de que tu honor pesa más que tu ambición.`,
  },
  {
    id: 'la-dama-del-lago-de-hielo',
    title: 'La Dama del Lago de Hielo',
    journey: null,
    content: `El invierno se adelantó mientras cruzabas los Picos de Plata. El frío no era solo una temperatura, era una presencia que intentaba dormir tus sentidos. Buscando refugio de una ventisca, llegaste a la orilla de un lago cuya superficie era un espejo de cristal perfecto. Allí, sentada sobre una piedra, una mujer de cabellos plateados lloraba lágrimas que se convertían en perlas antes de tocar el suelo.

Te contó que era la protectora del valle, y que su hermano, el viento del sur, se había marchado para no volver, dejando el lugar en un invierno eterno. Pasaste tres días ayudándola a recolectar las flores de escarcha que crecían bajo la nieve, las únicas que podían mantener viva la llama de su hogar. En el proceso, hablasteis de lo que significa perder algo que dábamos por sentado: una casa, un amigo, un tiempo que ya no volverá.

No pudiste traer la primavera de vuelta, pero le diste algo que ella había olvidado: compañía en el dolor. Al marcharte, te entregó una de sus perlas de llanto. "Para que recuerdes", dijo, "que incluso en el frío más absoluto, la belleza persiste si alguien se molesta en buscarla". Caminaste hacia el siguiente valle con el corazón encogido, entendiendo que no todas las misiones terminan en victoria, pero todas dejan una huella.`,
  },
  {
    id: 'el-encuentro-en-la-encrucijada',
    title: 'El Encuentro en la Encrucijada',
    journey: null,
    content: `Habías recorrido cientos de leguas cuando llegaste a la Gran Encrucijada de los Tres Reinos. Allí, bajo un sauce llorón de hojas doradas, encontraste a otra viajera. Su armadura estaba tan abollada como la tuya y su capa tenía los mismos jirones causados por las zarzas del camino. No se dijeron nada al principio; simplemente compartieron el fuego. Ella cocinó unas raíces silvestres y tú ofreciste el poco pan seco que te quedaba.

A medida que la noche avanzaba, la conversación fluyó como un río tras el deshielo. No hablabais de grandes hazañas, sino de los miedos pequeños: el miedo a no ser suficiente, el miedo a que el viaje no tenga un destino real. Por un momento, en mitad de aquel mundo vasto y a menudo hostil, no fuiste un aventurero solitario. Fuiste parte de algo.

Al amanecer, ella debía seguir hacia el este y tú hacia el norte. No hubo promesas de reencuentro eterno, solo un abrazo largo y el intercambio de una pequeña cinta roja. "Guárdala", te susurró, "para que cuando el camino sea oscuro, sepas que hay alguien en algún lugar que está caminando bajo el mismo cielo". Seguiste tu ruta con una sonrisa nueva, comprendiendo que el amor no siempre es un destino, a veces es el combustible para seguir andando.`,
  },
  {
    id: 'el-fuego-de-los-extraños',
    title: 'El Fuego de los Extraños',
    journey: null,
    content: `La nieve del Paso del Norte era cruel. Habías perdido el rastro y tu antorcha se había apagado. La noche se cernía, un manto negro lleno de aullidos lejanos. La muerte por frío parecía inevitable. Fue entonces cuando viste un resplandor anaranjado entre los árboles.

Te acercaste con cautela, mano en la empuñadura. En un pequeño refugio de piedra, encontraste a tres viajeros: una elfa arquera, un enano herrero y un bardo humano con una pata rota. Nadie desenvainó armas. El enano simplemente apartó una piedra cerca del fuego y dijo: "Siéntate. El fuego es de todos y de nadie". Esa noche no hubo batallas. Compartieron un guiso terrible hecho de raíces y carne seca. El bardo tocó una flauta desafinada, la elfa contó historias de ciudades flotantes y tú, por primera vez, hablaste de tus miedos, no de tus victorias.

Se dieron cuenta de que provenían de mundos distintos, enemigos en otras tierras, quizás rivales en otros tiempos. Pero esa noche, bajo la nieve y el fuego, eran solo almas calentándose las manos. Al amanecer, no intercambiaron promesas ni juramentos. Solo una mirada de respeto. Un aventurero suele caminar solo, pero las mejores historias nacen de esos breves instantes donde el camino se cruza con el de otro. Saliste al frío, pero por primera vez en semanas, no sentías el helor en el pecho.`,
  },
  {
    id: 'el-umbral-de-los-susurros',
    title: 'El Umbral de los Susurros',
    journey: null,
    content: `Te detuviste al borde del Bosque de Vyr, donde la niebla no tocaba el suelo, sino que flotaba como un mar de leche. No había bestias ni trampas a la vista, solo un silencio tan profundo que dolía en los oídos. Habías escuchado historias sobre este lugar: decían que el bosque no juzgaba tus habilidades con la espada, sino tu determinación. Diste un paso adelante. La niebla te tragó al instante.

No hubo oscuridad, sino una luz tenue y verdosa. Los árboles aquí no eran madera, sino cristales fosilizados que vibraban con cada latido de tu corazón. Mientras avanzabas, notaste que el camino no era recto. Se retorcía según tus dudas. Si pensabas en rendirte, el suelo se volvía fango; si recordabas por qué habías comenzado tu travesía, el suelo se solidificaba en piedra firme.

En el centro del bosque, encontraste un claro donde un anciano de roca tallaba figuritas. No levantó la vista, pero habló con una voz que sonaba a grava deslizándose: "Los héroes buscan el final del camino, los aventureros aprenden a caminar sobre la niebla". No buscaste un tesoro ni un jefe final. Te sentaste junto al anciano y observaste cómo la niebla formaba figuras de lugares lejanos que aún no visitabas. Cuando saliste al otro lado, tus ojos reflejaban una certeza nueva: no tenías miedo a perderte, porque perderte era parte del mapa.`,
  },
  {
    id: 'la-maldicion-del-yelmo-cantarin',
    title: 'La Maldición del Yelmo Cantarín',
    journey: null,
    content: `Todo comenzó cuando encontraste un cofre brillante en las mazmorras del Castillo Olvidado. Esperabas oro, quizás una espada rúnica. En su lugar, hallaste un yelmo de hierro oxidado que prometía "sabiduría infinita" en su inscripción. Confiado, te lo colocaste. El yelmo no otorgaba sabiduría. Otorgaba un repertorio inagotable de canciones de taberna desafinadas, y se negaba a quedarse callado.

Caminar por el bosque se volvió una tortura. Intentabas acechar a un grupo de bandidos, y el yelmo comenzaba a tararear una balada sobre un pato que quería ser rey. ¡Cua, cua, cua! sonaba el metal con eco, alertando a media legua a la redonda. Los bandidos no te atacaron; se rieron tanto que uno se cayó de un árbol. Rojo de furia bajo el hierro, tuviste que sentarte a esperar a que terminaran los aplausos del yelmo antes de poder hablar.

Intentaste quitártelo, pero el metal estaba pegado a tu cabeza mediante magia bromista. Durante tres días viviste una vida de música no deseada. Pero la cosa cambió cuando te encontraste con un Troll de puente que demandaba un tributo. No tenías monedas. El yelmo, en un acto de "genio", rompió a cantar una ópera épicamente mala. El Troll, aturdido por el vibrato metálico, gritó: "¡Basta! ¡Lárgate! ¡Te pago tú para que te vayas!". Saliste de allí con una bolsa de gemas. Aprendiste una lección valiosa: a veces, la vergüenza es el arma más poderosa.`,
  },
  {
    id: 'la-moneda-del-mendigo',
    title: 'La Moneda del Mendigo',
    journey: null,
    content: `Llovía sobre la ciudad de Oakhaven, una lluvia gris que limpiaba las piedras y el alma. Caminabas por el distrito bajo, con la bolsa llena de monedas tras un trabajo bien hecho. En un rincón, un mendigo extendió una mano temblorosa. No pedía comida, ni oro. Pedía justicia.

El mendigo te explicó que un comerciante corrupto le había quitado su tienda con trampas legales. Te tendió una moneda de cobre, la última que le quedaba. "Es todo lo que tengo para pagarte. Necesito que recuperes mis escrituras". Sabías que el comerciante era peligroso y tenía guardias. Por una moneda de cobre, no valía la pena el riesgo. Podrías haberlo ignorado. Podrías haberle dado una moneda de oro y seguir tu camino. Pero miraste el cobre, pesado y frío en tu mano. Tuviste que tomar una decisión: ser un mercenario para el mejor postor, o ser un caballero para quien no tenía nada.

Esa noche, no entraste a robar las escrituras. Entraste para asustar al comerciante, utilizando tu reputación y unas cuantas sombras bien colocadas para convencerlo de que devolver lo robado era mejor que perder la paz. Al día siguiente, el mendigo recuperó su tienda. No hubo gloria ni canciones. Solo la sensación de haber hecho lo correcto cuando nadie miraba. Guardaste la moneda de cobre en tu bota, recordando que el valor de un hombre no se mide por lo que gana, sino por lo que elige proteger.`,
  },
  {
    id: 'cenizas-en-la-torre-de-marfil',
    title: 'Cenizas en la Torre de Marfil',
    journey: null,
    content: `El viento aullaba alrededor de la Torre de Marfil, el lugar donde se decía que los magos guardaban los recuerdos del mundo. Subiste los mil escalones con una carta en el pecho, una carta escrita hace años que nunca pudiste enviar. Buscabas al Guardián del Tiempo, un ser capaz de retroceder un día, solo uno, para despedirte de tu hermano caído en batalla.

Cuando llegaste a la cima, la sala estaba vacía, excepto por un espejo roto y polvo en el suelo. El Guardián había muerto hacía siglos. No había magia que reparar el pasado. Te dejaste caer sobre las losas frías. Toda la constancia, todo el entrenamiento, todo el "no rendirse" te había llevado a una habitación vacía.

Te quedaste allí, viendo cómo el atardecer teñía el cielo de rojo sangre. Sentiste el peso de la armadura, la fatiga en los huesos. Sacaste la carta y, por primera vez en años, lloraste. No fue un llanto de debilidad, sino de liberación. Dejaste que el viento se llevara el papel, que se quemó al contacto con la magia residual de la torre. Entendiste, mientras bajabas, que no todas las misiones tienen un final feliz. A veces, la verdadera aventura es aprender a cargar con el vacío y seguir caminando. No obtuviste el tiempo que deseabas, pero obtuviste la paz de aceptar que lo perdido se queda en el ayer.`,
  },
];

/**
 * Devuelve la historia asignada para un número de viaje dado,
 * teniendo en cuenta las historias ya desbloqueadas por el usuario.
 *
 * @param {number} journeyNumber - El número de viaje completado (1, 2, 3...)
 * @param {Array<{journeyId: number, storyId: string}>} unlockedStories - Historias ya desbloqueadas
 * @returns {{ id, title, content } | null}
 */
export function assignStoryForJourney(journeyNumber, unlockedStories = []) {
  // Viaje 1 → siempre la misma historia
  if (journeyNumber === 1) {
    return STORIES.find(s => s.journey === 1) ?? null;
  }

  // Obtener IDs de historias ya desbloqueadas
  const usedIds = new Set(unlockedStories.map(s => s.storyId));

  // Pool: historias sin journey fijo y aún no desbloqueadas
  const pool = STORIES.filter(s => s.journey === null && !usedIds.has(s.id));

  if (pool.length === 0) return null;

  // Selección aleatoria
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Devuelve los datos de una historia por su ID.
 */
export function getStoryById(storyId) {
  return STORIES.find(s => s.id === storyId) ?? null;
}
