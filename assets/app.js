(() => {
  const questions = [
    {
      id: 'situation',
      prompt: 'Which situation feels closest?',
      choices: [
        ['customer', 'Customers are getting missed or waiting too long.'],
        ['tools', 'Our tools are becoming another job to manage.'],
        ['unclear', 'I know something should work better, but I’m not sure what.']
      ]
    },
    {
      id: 'stage',
      prompt: 'Where is the business right now?',
      choices: [
        ['new', 'New or just getting established.'],
        ['growing', 'Established and growing beyond our old way of working.'],
        ['mature', 'Established, with several systems already in place.']
      ]
    },
    {
      id: 'current',
      prompt: 'What best describes what you already have?',
      choices: [
        ['simple', 'Mostly phone, email, calendar or spreadsheets.'],
        ['some', 'One or two business tools that mostly work.'],
        ['many', 'Several tools, subscriptions or handoffs.']
      ]
    },
    {
      id: 'constraint',
      prompt: 'What matters most about changing this?',
      choices: [
        ['simple', 'Keep it simple. I do not want another system to manage.'],
        ['preserve', 'Keep what already works and avoid retraining people.'],
        ['capability', 'I’m open to changing tools if the improvement is meaningful.']
      ]
    },
    {
      id: 'detail',
      prompt: 'In one or two sentences, what keeps happening that you want to stop?',
      text: true,
      placeholder: 'Example: I’m on jobs most of the day, calls go to voicemail, and I spend evenings figuring out who still needs a callback.'
    }
  ];

  const state = { index: 0, answers: {} };
  const log = document.querySelector('#conversation-log');
  const form = document.querySelector('#interview-form');
  const fieldset = document.querySelector('#choice-fieldset');
  const questionLabel = document.querySelector('#question-label');
  const choiceList = document.querySelector('#choice-list');
  const textWrap = document.querySelector('#text-wrap');
  const textLabel = document.querySelector('#text-label');
  const textAnswer = document.querySelector('#text-answer');
  const continueButton = document.querySelector('#continue-button');
  const backButton = document.querySelector('#back-button');
  const status = document.querySelector('#form-status');
  const result = document.querySelector('#result');
  const resultClass = document.querySelector('#result-class');
  const resultTitle = document.querySelector('#result-title');
  const resultSummary = document.querySelector('#result-summary');
  const resultWhy = document.querySelector('#result-why');
  const resultFirst = document.querySelector('#result-first');
  const resultAvoid = document.querySelector('#result-avoid');
  const copyButton = document.querySelector('#copy-button');
  const restartButton = document.querySelector('#restart-button');

  const labels = Object.fromEntries(questions.flatMap(q => (q.choices || []).map(([value, label]) => [`${q.id}:${value}`, label])));

  function addMessage(kind, text) {
    const item = document.createElement('div');
    item.className = `message ${kind}`;
    const p = document.createElement('p');
    p.textContent = text;
    item.appendChild(p);
    log.appendChild(item);
  }

  function renderQuestion() {
    const q = questions[state.index];
    status.textContent = '';
    questionLabel.textContent = q.prompt;
    textLabel.textContent = q.prompt;
    choiceList.replaceChildren();
    textAnswer.value = state.answers[q.id] || '';
    textAnswer.placeholder = q.placeholder || '';

    if (q.text) {
      fieldset.hidden = true;
      textWrap.hidden = false;
      window.setTimeout(() => textAnswer.focus(), 0);
    } else {
      fieldset.hidden = false;
      textWrap.hidden = true;
      q.choices.forEach(([value, label], i) => {
        const wrap = document.createElement('div');
        wrap.className = 'choice';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'choice';
        input.id = `choice-${state.index}-${i}`;
        input.value = value;
        input.checked = state.answers[q.id] === value;
        const lab = document.createElement('label');
        lab.htmlFor = input.id;
        lab.textContent = label;
        wrap.append(input, lab);
        choiceList.appendChild(wrap);
      });
      const checked = choiceList.querySelector('input:checked') || choiceList.querySelector('input');
      window.setTimeout(() => checked?.focus(), 0);
    }

    backButton.hidden = state.index === 0;
    continueButton.textContent = state.index === questions.length - 1 ? 'Show my next step' : 'Continue';
  }

  function rebuildLog() {
    log.replaceChildren();
    addMessage('assistant', 'You do not need to know which product or service you need. Start with what is happening.');
    questions.slice(0, state.index).forEach(q => {
      const answer = state.answers[q.id];
      if (!answer) return;
      addMessage('assistant', q.prompt);
      addMessage('user', q.text ? answer : labels[`${q.id}:${answer}`]);
    });
  }

  function readAnswer() {
    const q = questions[state.index];
    if (q.text) return textAnswer.value.trim();
    return form.querySelector('input[name="choice"]:checked')?.value || '';
  }

  function decide(a) {
    // The first version deliberately uses visible, testable rules instead of hidden vendor ranking.
    if (a.situation === 'tools' && a.current === 'many') {
      return {
        cls: 'SIMPLIFY / CONNECT',
        title: 'Start with the system you already have before buying another one.',
        summary: 'Your answers suggest the problem is more likely accumulated tools and handoffs than a missing category of software.',
        why: 'Several systems plus a strong preference for simplicity usually means another subscription could increase the burden before it fixes the underlying workflow.',
        first: 'Map one customer journey from first contact through completion. Identify duplicate entry, unclear ownership and places where information stops moving.',
        avoid: 'Do not start by replacing the entire stack or adding a general “all-in-one” platform until you know which handoff is actually failing.'
      };
    }
    if (a.situation === 'customer' && a.constraint === 'preserve' && (a.current === 'some' || a.current === 'many')) {
      return {
        cls: 'CONNECT / ADD',
        title: 'Protect the systems your team already knows and solve the customer-contact gap around them.',
        summary: 'You appear to have useful infrastructure already. The likely opportunity is a focused front-desk, follow-up or routing layer rather than a wholesale replacement.',
        why: 'The customer problem is real, but retraining or replacing functioning systems creates a second problem. A bounded connection is the safer first test.',
        first: 'Define exactly what should happen when a customer reaches you and nobody can respond immediately: what can be answered, what must be captured and when a person takes over.',
        avoid: 'Do not buy a new CRM just because the current symptom involves missed calls, delayed replies or scheduling.'
      };
    }
    if (a.situation === 'customer' && a.current === 'simple') {
      return {
        cls: 'ADD — BOUNDED',
        title: 'Add one customer-contact capability, not an entire operating system.',
        summary: 'The business sounds simple enough that a focused answering, intake, scheduling or follow-up layer may solve the immediate problem without forcing a larger software transition.',
        why: 'The strongest need is customer responsiveness, while your existing operating structure is still relatively light.',
        first: 'Choose one repeated missed-contact situation and define the smallest successful workflow around it. Test that before expanding automation.',
        avoid: 'Avoid enterprise field-service or CRM platforms unless another concrete business need justifies them.'
      };
    }
    if (a.stage === 'new' && a.current === 'simple') {
      return {
        cls: 'KEEP / START SMALL',
        title: 'You may not need much more technology yet.',
        summary: 'A new business can usually learn more by establishing a simple repeatable customer process before buying a larger software stack.',
        why: 'Early systems should create clarity without locking you into assumptions that have not been tested with enough real customers.',
        first: 'Make the current path dependable: how a customer reaches you, how you respond, how the next step gets scheduled and how you remember the follow-up.',
        avoid: 'Do not build for a future 50-person company before the present workflow has proven what it actually needs.'
      };
    }
    if (a.constraint === 'capability' && a.current === 'many') {
      return {
        cls: 'REVIEW / POSSIBLE REPLACE',
        title: 'A replacement may make sense, but only after a short systems review.',
        summary: 'You are open to meaningful change and already carry several systems. That creates a legitimate consolidation opportunity if the economics and workflow support it.',
        why: 'Replacement is most useful when it removes structural duplication or recurring limits—not simply because another product has more features.',
        first: 'Compare the current stack by responsibility, monthly cost, usage, integrations and failure points. Then identify which capabilities must survive a replacement.',
        avoid: 'Do not compare vendors feature-for-feature before identifying the few responsibilities the business actually depends on.'
      };
    }
    return {
      cls: 'REVIEW / OPTIMIZE',
      title: 'Clarify the repeated business problem before choosing technology.',
      summary: 'There is enough friction to justify attention, but not enough evidence yet that another product is the answer.',
      why: 'The same symptom can come from missing software, poor configuration, unclear ownership or a workflow that was never designed as the business grew.',
      first: 'Describe one real recent example from beginning to end: what triggered it, who touched it, which tools were involved and where the experience became harder than it should have been.',
      avoid: 'Avoid shopping from a generic “best software” list until the failure point is specific enough to compare solutions against.'
    };
  }

  function showResult() {
    const r = decide(state.answers);
    resultClass.textContent = r.cls;
    resultTitle.textContent = r.title;
    resultSummary.textContent = r.summary;
    resultWhy.textContent = r.why;
    resultFirst.textContent = r.first;
    resultAvoid.textContent = r.avoid;
    form.hidden = true;
    result.hidden = false;
    result.focus();
    window.history.replaceState(null, '', '#result');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const q = questions[state.index];
    const answer = readAnswer();
    if (!answer) {
      status.textContent = q.text ? 'Add a short description so I can use it in the recommendation.' : 'Choose the situation that is closest.';
      return;
    }
    state.answers[q.id] = answer;
    if (state.index < questions.length - 1) {
      state.index += 1;
      rebuildLog();
      renderQuestion();
    } else {
      rebuildLog();
      addMessage('assistant', q.prompt);
      addMessage('user', answer);
      showResult();
    }
  });

  backButton.addEventListener('click', () => {
    if (state.index === 0) return;
    state.index -= 1;
    rebuildLog();
    renderQuestion();
  });

  restartButton.addEventListener('click', () => {
    state.index = 0;
    state.answers = {};
    result.hidden = true;
    form.hidden = false;
    rebuildLog();
    renderQuestion();
    document.querySelector('#conversation-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  copyButton.addEventListener('click', async () => {
    const parts = [
      `oobIT result: ${resultClass.textContent}`,
      resultTitle.textContent,
      '',
      `Summary: ${resultSummary.textContent}`,
      `Why: ${resultWhy.textContent}`,
      `First step: ${resultFirst.textContent}`,
      `Avoid for now: ${resultAvoid.textContent}`,
      '',
      'My answers:',
      ...questions.map(q => {
        const value = state.answers[q.id] || '';
        return `- ${q.prompt} ${q.text ? value : (labels[`${q.id}:${value}`] || value)}`;
      })
    ];
    try {
      await navigator.clipboard.writeText(parts.join('\n'));
      copyButton.textContent = 'Copied';
      window.setTimeout(() => { copyButton.textContent = 'Copy my summary'; }, 1600);
    } catch {
      copyButton.textContent = 'Copy unavailable';
    }
  });

  rebuildLog();
  renderQuestion();
})();
