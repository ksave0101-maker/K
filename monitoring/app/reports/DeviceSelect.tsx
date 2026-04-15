"use client"
import React from 'react'

export default function DeviceSelect({ formId }: { formId: string }) {
  // client-side helper to auto-submit the form when select changes
  return (
    <script dangerouslySetInnerHTML={{ __html: `
      (function(){
        const f = document.getElementById(${JSON.stringify(formId)});
        if(!f) return;
        const s = f.querySelector('select[name="device"]');
        if(!s) return;
        s.addEventListener('change', function(){ f.requestSubmit(); });
      })();
    ` }} />
  )
}
