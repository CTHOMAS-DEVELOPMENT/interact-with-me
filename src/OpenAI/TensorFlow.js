//https://playground.com/
//https://www.tensorflow.org/js/models
//Portrait depth estimation
//Text toxicity
//Body segmentation
//Invisibility
//Nicholas Renotte
//https://www.youtube.com/@NicholasRenotte/videos
//https://github.com/nicknochnack/QnA-Web-App-with-React-and-Tensorflow.JS/blob/main/src/App.js

//node-nlp
//https://ai.google.dev/gemma/?utm_source=gdm&utm_medium=referral&utm_campaign=gemma_cta&utm_content=promo_banner#models
//+++++
//https://www.remove.bg/upload
//https://voicemaker.in/
//Super Lazy Coder
//https://www.youtube.com/watch?v=NC_g3T4YXoM
//https://huggingface.co/models?library=transformers.js&pipeline_tag=question-answering
//https://huggingface.co/docs/transformers.js/en/index#supported-tasksmodels
//https://app.haiper.ai/explore
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
