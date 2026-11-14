/* EN/DE interface switch (requirement), plus Arabic for the parent's display language.
   Strings are keyed by their English text; anything missing falls back to English. */
window.I18N = {
  de: {
    'Back': 'Zurück', 'Sign in': 'Anmelden', 'Sign out': 'Abmelden', 'Next': 'Weiter', 'Yes': 'Ja', 'Not yet': 'Noch nicht', 'Cancel': 'Abbrechen', 'Save': 'Speichern',
    'Who are you?': 'Wer bist du?', 'Tap your 4 secret pictures': 'Tippe deine 4 geheimen Bilder', 'Wrong pictures – try again!': 'Falsche Bilder – versuch es noch einmal!',
    'Forgot your pictures? Ask your teacher.': 'Bilder vergessen? Frag deine Lehrerin.', 'Clear': 'Löschen',
    'Hi': 'Hallo', 'My exams': 'Meine Prüfungen', 'My results': 'Meine Ergebnisse', 'Messages': 'Nachrichten', 'Practice': 'Üben', 'Home': 'Start',
    'Send': 'Senden', 'In class': 'In der Klasse', 'Take-home': 'Hausaufgabe', 'pages': 'Seiten',
    'Sent': 'Gesendet', 'Teacher is checking': 'Lehrerin prüft', 'Results ready': 'Ergebnis fertig', 'Not sent yet': 'Noch nicht gesendet',
    'Before you start': 'Bevor du anfängst', 'My name is on every page': 'Mein Name steht auf jeder Seite', 'I answered all the questions': 'Ich habe alle Fragen beantwortet', 'My pages are in order': 'Meine Seiten sind in der richtigen Reihenfolge',
    'Take a photo of page': 'Mach ein Foto von Seite', 'Take photo': 'Foto machen', 'Use a sample page (demo)': 'Beispielseite nehmen (Demo)', 'Try a blurry photo (demo)': 'Unscharfes Foto testen (Demo)',
    'Is this page': 'Ist das Seite', 'Yes, it is!': 'Ja, stimmt!', 'Take it again': 'Nochmal fotografieren',
    'Are these your pages?': 'Sind das deine Seiten?', 'Add page': 'Seite hinzufügen', 'Submit': 'Abschicken', 'Sending…': 'Wird gesendet…', 'Submitted!': 'Abgeschickt!',
    'Ask teacher': 'Lehrerin fragen', 'Listen': 'Anhören', 'My mistakes': 'Meine Fehler', 'Practise': 'Üben', 'Your answer': 'Deine Antwort', 'Right answer': 'Richtige Antwort',
    'Results not ready yet': 'Ergebnis noch nicht fertig', 'Your teacher is still checking.': 'Deine Lehrerin prüft noch.',
    'Today': 'Heute', 'Classes': 'Klassen', 'Exams': 'Prüfungen', 'Students': 'Schüler', 'Open': 'Öffnen', 'Check': 'Prüfen', 'Remind': 'Erinnern',
    'Missing': 'Fehlt', 'Text to check': 'Text prüfen', 'Text checked': 'Text geprüft', 'Graded': 'Bewertet', 'Released': 'Freigegeben',
    'Mark scheme': 'Bewertungsschema', 'Start spotlight check': 'Spotlight-Prüfung starten', 'Approve text for grading': 'Text zur Bewertung freigeben',
    'AI grades': 'KI-Noten', 'Change mark': 'Punkte ändern', 'Feedback': 'Feedback', 'Approve feedback': 'Feedback freigeben',
    'Learning gaps and recurring mistakes': 'Lernlücken und wiederkehrende Fehler', 'Why this flag?': 'Warum diese Markierung?', 'Confirm red flag': 'Warnung bestätigen', 'Dismiss': 'Verwerfen',
    'Release results': 'Ergebnisse freigeben', 'Release': 'Freigeben', 'History': 'Verlauf', 'Next step': 'Nächster Schritt'
  },
  ar: {
    'Back': 'رجوع', 'Sign in': 'تسجيل الدخول', 'Sign out': 'تسجيل الخروج', 'Home': 'الرئيسية', 'Your children': 'أطفالك',
    'App language': 'لغة التطبيق', 'Latest result': 'آخر نتيجة', 'Progress': 'التقدم', 'Needs support': 'يحتاج إلى دعم',
    'Practice at home': 'التدريب في المنزل', 'Not done yet': 'لم يكتمل بعد', 'Done': 'تم', 'Teacher’s note and why': 'ملاحظة المعلمة والسبب',
    'See the practice': 'عرض التدريب', 'No flags – nothing needs your attention.': 'لا توجد تنبيهات – لا شيء يحتاج إلى انتباهك.',
    'You only see results after the teacher has checked and released them.': 'ترى النتائج فقط بعد أن تراجعها المعلمة وتنشرها.',
    'Exams stay in their own language (English or German).': 'تبقى الامتحانات بلغتها الأصلية (الإنجليزية أو الألمانية).',
    'Not released yet': 'لم تُنشر بعد', 'The teacher is still checking this exam.': 'المعلمة ما زالت تراجع هذا الامتحان.'
  }
};
window.t = function (s, lang) {
  const l = lang || (window.store ? store.get().lang : 'en');
  if (l === 'en') return s;
  return (window.I18N[l] && window.I18N[l][s]) || s;
};
