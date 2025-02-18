import React from 'react'
import useValidateSession from '../utils/session';

function page() {
  useValidateSession();
  return (
    <div>page</div>
  )
}

export default page