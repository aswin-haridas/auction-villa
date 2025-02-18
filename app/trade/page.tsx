import React from 'react'
import useValidateSession from '../utils/session';

const Trade = () => {
  useValidateSession();
  return (
    <div>Trade</div>
  )
}

export default Trade