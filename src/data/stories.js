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
    content: `El sol apenas lograba perforar la niebla de los Bosques Susurrantes cuando ajustaste las correas de tu mochila. No había bandas de música ni multitudes despidiéndote; solo el eco de tus propios pasos sobre la tierra húmeda. Durante los primeros días, el silencio fue tu único compañero. La duda es un monstruo pesado: ¿realmente eras capaz de cruzar la Gran Brecha?

Al tercer día, encontraste un carro volcado. Siguiendo el rastro, hallaste a un viejo cartógrafo atrapado. "El mundo no espera a los que se quedan sentados", gruñó mientras lo ayudabas. A cambio, te entregó un mapa de cuero curtido. "La aventura no es llegar al final, muchacho, es no dar media vuelta cuando las botas pesan". Esa noche, bajo un cielo estrellado, comprendiste que el mapa estaba en blanco en muchas áreas. Esas áreas eran tuyas para escribirlas.`,
  },
  {
    id: 'la-posada-de-los-suspiros',
    title: 'La Posada de los Suspiros',
    journey: 2,
    content: `Llegaste a Oakhaven con barro hasta las rodillas. En "La Posada del Trasgo Ciego", un bardo semi-elfo borracho intentaba explicar la gravedad a unos mercenarios. Te viste arrastrado a una competición de pulsos contra una orco llamada Grogda. Perdiste, pero tu honestidad te valió una jarra y una historia sobre el honor orco. Saliste de Oakhaven con menos monedas pero con el espíritu ligero, aprendiendo que a veces el mayor peligro no es una espada, sino una taberna en fiesta.`,
  },
  {
    id: 'el-guardian-de-la-ruina',
    title: 'El Guardián de la Ruina',
    journey: 3,
    content: `En el Cañón de las Sombras, hallaste un templo olvidado. Un amuleto pulsaba en el altar, prometiendo poder infinito. Pero un espíritu guardián te advirtió: "Si lo tomas, la memoria de este lugar se desvanecerá. El poder vendrá del olvido". Dejaste el amuleto. Al salir, el aire se sintió cálido. Habías ganado algo que ningún objeto da: la certeza de que tu honor pesa más que tu ambición.`,
  },
  {
    id: 'la-dama-del-lago-de-hielo',
    title: 'La Dama del Lago de Hielo',
    journey: 4,
    content: `En los Picos de Plata, encontraste a una mujer llorando perlas de hielo. Era la protectora de un valle en invierno eterno. Ayudaste a recolectar flores de escarcha para su hogar. No pudiste traer la primavera, pero le diste compañía. Te regaló una perla: "Para que recuerdes que incluso en el frío, la belleza persiste". Entendiste que no todas las misiones terminan en victoria, pero todas dejan huella.`,
  },
  {
    id: 'el-encuentro-en-la-encrucijada',
    title: 'Encrucijada de Destinos',
    journey: 5,
    content: `En la Gran Encrucijada, compartiste fuego con otra viajera. No hubo grandes historias, solo confesiones de miedos pequeños. Al amanecer, se separaron intercambiando una cinta roja. "Para que sepas que alguien camina bajo el mismo cielo", dijo. Seguiste tu ruta comprendiendo que la compañía, aunque breve, es el mejor combustible.`,
  },
  {
    id: 'el-fuego-de-los-extranos',
    title: 'Fuego Compartido',
    journey: 6,
    content: `Bajo la nieve del Paso del Norte, encontraste refugio con tres extraños: una elfa, un enano y un bardo. Enemigos en otras tierras, esa noche solo eran almas buscando calor. Compartieron un guiso terrible y silencios cómodos. Al amanecer, partieron con una mirada de respeto. A veces, la paz no se firma en tratados, sino que se comparte alrededor de una hoguera.`,
  },
  {
    id: 'el-umbral-de-los-susurros',
    title: 'El Bosque de Niebla',
    journey: 7,
    content: `El Bosque de Vyr no juzgaba tu espada, sino tu mente. La niebla formaba caminos según tus dudas. En el centro, un anciano tallaba figuras. "Los héroes buscan el final; los aventureros aprenden a caminar sobre la niebla", dijo. Te sentaste con él, aprendiendo que perderse es parte esencial del mapa.`,
  },
  {
    id: 'la-maldicion-del-yelmo',
    title: 'El Yelmo Cantarín',
    journey: 8,
    content: `Encontraste un yelmo que prometía sabiduría, pero solo cantaba baladas desafinadas. Arruinó tu sigilo, pero sus canciones espantaron a un Troll que odiaba la ópera, salvándote la vida. Aprendiste que a veces, tus defectos más ruidosos pueden ser tu mayor defensa.`,
  },
  {
    id: 'la-moneda-del-mendigo',
    title: 'Justicia de Cobre',
    journey: 9,
    content: `Un mendigo te pagó con su última moneda de cobre para recuperar sus escrituras de un mercader corrupto. No ganaste oro esa noche, pero al ver al hombre recuperar su tienda, la moneda de cobre en tu bolsillo pesó más que cualquier tesoro real.`,
  },
  {
    id: 'cenizas-torre-marfil',
    title: 'La Torre Vacía',
    journey: 10,
    content: `Subiste mil escalones buscando al Guardián del Tiempo para cambiar el pasado. La torre estaba vacía. Lloraste, no por debilidad, sino por liberación. Entendiste que la verdadera magia no es retroceder el tiempo, sino tener el coraje de seguir caminando a pesar de las cicatrices.`,
  },
    {
    id: 'journey_11',
    title: 'El Horizonte Infinito',
    journey: 11,
    content: `Más allá de los mapas conocidos, el mundo se vuelve extraño. Los árboles tienen colores que no tienen nombre y el agua fluye hacia arriba. Aquí, te diste cuenta de que la "normalidad" era solo una costumbre de tu aldea.`,
  },
  {
    id: 'journey_12',
    title: 'La Ciudad de Cristal',
    journey: 12,
    content: `Una ciudad hecha de vidrio cantaba con el viento. Sus habitantes no hablaban, se comunicaban con música. Tuviste que aprender a escuchar no las palabras, sino las intenciones detrás de la melodía.`,
  },
  {
    id: 'journey_13',
    title: 'El Valle de los Ecos',
    journey: 13,
    content: `Cada palabra dicha aquí se repetía por siglos. Escuchaste consejos de aventureros de hace mil años. Aprendiste a medir tus palabras, sabiendo que lo que dices hoy puede resonar para siempre.`,
  },
   {
    id: 'journey_14',
    title: 'El Puente de las Estrellas',
    journey: 14,
    content: `Un puente de luz cruzaba el vacío entre dos montañas. Solo se solidificaba si creías que podías cruzarlo. La fe en uno mismo dejó de ser una frase bonita para convertirse en la única física que importaba.`,
  },
  {
    id: 'journey_15',
    title: 'La Biblioteca Sumergida',
    journey: 15,
    content: `Bajo el lago, libros impermeables contaban la historia no de los reyes, sino de los campesinos. Descubriste que la verdadera historia del mundo la escriben las manos llenas de tierra, no las que sostienen cetros.`,
  },
    {
    id: 'journey_20',
    title: 'La Cima del Mundo',
    journey: 20,
    content: `Desde aquí arriba, las fronteras de los reinos son invisibles. Todo es una sola tierra conectada. Comprendiste que las divisiones están en los mapas, no en el suelo. Eres ciudadano de todo lo que pisas.`,
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
