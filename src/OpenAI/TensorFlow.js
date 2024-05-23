//https://playground.com/

//https://dezgo.com/txt2img
import { useEffect, useState } from 'react';
import * as qna from '@tensorflow-models/qna';

function QAndA() {
  const [model, setModel] = useState(null);
  const [answer, setAnswer] = useState([]);

  const [passage, setPassage] = useState('');
  const [question, setQuestion] = useState('');

  const loadModel = async () => {
    const loadedModel = await qna.load();
    setModel(loadedModel);
  };

  useEffect(() => {
    loadModel();
  }, []);

  const answerQuestions = async (e) => {
    if (e.which === 13 && model !== null) {
      const answers = await model.findAnswers(passage, question);
      setAnswer(answers);
    }
  };

  return (
    <div className='App'>
      <header className='App-header'>
        {model !== null ? (
          <div>
            <div>
              <div>Passage</div>
              <textarea
                onChange={(e) => {
                  setPassage(e.target.value);
                }}
                className='border border-black'
                row='30'
                cols='100'
              ></textarea>
            </div>
            <div>
              <div>Ask question</div>
              <input
                onChange={(e) => {
                  setQuestion(e.target.value);
                }}
                type='text'
                className='border border-black'
                onKeyPress={answerQuestions}
              />
            </div>
          </div>
        ) : (
          <div>Loading..</div>
        )}
        {answer.length > 0 && (
          <div>
            {answer.map((e) => {
              return <div>{e.text}</div>;
            })}
          </div>
        )}
      </header>
    </div>
  );
}

export default QAndA;
