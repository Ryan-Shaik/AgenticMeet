![][image1]

**CSE471: System Analysis and Design**  
**Assignment on Functional Requirements**  
**Proposed Project Title: AgenticMeet**

| Group No: 1, CSE471 Lab Section: 03,  Spring 2026 |  |  |
| :---: | ----- | ----- |
| **SL** | **ID** | **Name** |
| 1 | 22301749 | Ryan Shaik |
| 2 | 22299173 | Anika Tabassum |
| 3 | 22201449 | Tabassum Munir Mahi |
|  |  |  |

**Submission Date: 24/02/26**

# **Project Overview**

**AgenticMeet** The AI-Driven Real-Time Conversational Video Conference SaaS Platform is a production-ready web-based system designed to enhance virtual meetings by integrating an intelligent AI participant into live video conferences. The platform enables real-time video communication, continuous speech recognition, AI-generated spoken responses, structured meeting intelligence, subscription-based access control, and automated communication workflows.

**Tech Stack:**

* Language: Typescript   
* Framework: Next.js  
* Styling: TailwindCSS & Shadcn UI  
* Database: PostgreSQL (Neon DB)  
* ORM: Drizzle  
* Deployment: Vercel  
* External APIs:

○ **OpenAI API:** For AI conversational intelligence, summary generation, action, and   
                        decision, detection. (Ryan shaik)  
 	○ **Google Speech-to-Text API:** For real-time streaming transcription and voice   
                                                   Detection. (Anika Tabassum)  
 	○ **Stripe API:** For subscription management and payment processing. (Tabassum   Munir Mahi)  
 	

 

**User Roles**

1. ### **End User:** Primary users who can create and join AI-assisted meetings, interact with the AI participant, view transcripts, access summaries, and manage subscriptions.

2. # **Team Admin:** Enterprise-level user who can manage team members, allocate subscription seats, monitor usage analytics, and manage billing.

   

3. # **System Admin:** A super-user responsible for managing subscription plans, monitoring platform performance, and overseeing revenue analytics.

   

**Functional Requirements**

| SL | Common Workflows |
| :---- | :---- |
| 1 | **Registration and Login System:** Implementation of Better Auth supporting Google and GitHub OAuth providers. Users can create accounts using email and password credentials. Upon successful registration, users can securely log in and access their personalized dashboard. Authentication is managed through secure session handling and role-based access control.  |
| 2 | **Role-Based Access Management** The system assigns access permissions based on user roles (End User, Team Admin, System Admin). Each role has access to specific features and dashboards according to system policy. |

| Module 1 |  |
| :---- | :---- |
| Member | Feature Description |
| 1 | **Real-Time AI Conversational Response Engine:** The system integrates and Ai participant into the live meetings that engages in bidirectional voice conversation. The AI will listen to the participant during meetings and generate contextual responses. Speak responses as audio within the meeting. |
| 2 | **Live transcript generation:** The system will provide real-time transcription during meetings. It will continuously convert participant speech into text and display a live transcript during meetings. Identify individual speakers. Store the transcript for future reference. |
| 3 | **Subscription and payment system:** Implementing subscription-based access control. Providing free, pro and enterprise subscription plans. Process recurring payments. Automatically activate or deactivate plans based on payment status. |
|  |  |

| Module 2 |  |
| :---- | :---- |
| Member | Feature Description |
| 1 | **AI-Based Structured Meeting Summary Engine:** After the meeting ends, the system generates a structured summary. The summary will include key discussion topics in structured sections. Highlight important discussion points. |
| 2 | **Conversation Analytics & Participation Metrics:** Generating analytical insights by analyzing the meeting transcript. For example, calculate the talk time percentage. Perform sentiment analysis on transcript data and present engagement analytics in a dashboard format. |
| 3 | **AI Usage Metering & Access Enforcement:** Developing subscription-based usage policies. Tracking ai interaction per user and maintaining a cumulative usage with the billing cycle. When usage exceeds plan limits restrict AI access and also provide a usage tracking dashboard. |
|  |  |

 

| Module 3 |  |
| :---- | :---- |
| Member | Feature Description |
| 1 | **AI Action Item Extraction System:** The system will automatically detect tasks mentioned during meetings. Generate a structured task list. |
| 1 | **AI Decision Detection & Tracking:** The AI will be able to identify any decision made during discussion. Store the decision in a searchable format. |
| 2 | **Real-Time Voice Activity & Interruption Detection System:** During meeting, while the  AI is speaking and detects participant speech it will stop and listen to the speaker. |
| 2 | **Context-based transcript search:** Advanced search of stored transcripts by supporting keyword-based search. Filtering the transcript by date or time. Navigating directly to specific recorded timestamps.  |
| 3 | **Revenue Reporting & Billing Analytics Dashboard:** The system provides administrative billing analytics.Display subscription growth metrics.Track recurring revenue trends. Provide downloadable billing reports. Monitor payment statuses.  |
| 3 | **Enterprise Team Subscription & Seat Management:** The system supports enterprise subscription management. Allow team admins to add or remove members. Allocate subscription seats. Calculate billing based on seat count. Enforce seat allocation limits.  |
|  |  |
|  |  |

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMEAAACxCAYAAAB9YNldAAAXtUlEQVR4Xu2dC/B9VVXHNw9FQOMNAhIDoscKJDLlL+JM2qgp4gNLS2omtJRMQ8gJQ3OsoXRoRmNqeqgUJvEbDUezl6Hx/4/m+MAsHkqYCoiBgqIJwp+H6Fr3nv37rfs9a++z93ndc+5dn5nv/H5377X22Wvvte89597zcM7onOKX/551OOnDpJ2kH7TQPaQPkQ4j4aYMY/lwYpJ+T0neIXR2YQvDGBpOOtKblYQcg84pbFEYfcCJRbpDSbox6+bCFoTRBk4g0hVKck1RlxW2IIxUKFnOVJKoja4lnULap5gvLNzkAt6mtH8B6QtKm230ItymYfiku01JmBzdStqvqEnytnD7pANItyt9yNGNRc99NSaCkhypun4sScT9KObHANjHFH0f2zPWhKLZbsZfFiNJ/BDcP9KlSt/r9Blsy1hRivwfr07DNqYE9f8VSkwx3YltGCtCMf/FFSc8Jmxi0nA8Sowx7YdtGBMlc/LvZftVphyPB5TYVaG/MTFoEk/HSQ1oJ/quOsV8MdynjIWmZ6C/MQFSJxj91o0i/ZPy2+hrjBSarIOUCdSErmsNj4cyRpr2RF9jRNAE3aRMGqpAP2MLGp9typihPot+xgigiblfmSwUuhkKPE7K2KG+i37GElEmCPUG9DHqoXG7SBnLBaGPMTA0CbvhpKDQx8gHx1QRuhhDQAN/tDIZUvejj9EcGs8HlTGWsh/XhoQGfFdlEqRegz5Ge2hc366MtRS6GH1AA72LMvhSe6CP0R3F/DoHHHNbCENR1C8AdDF6gMdZGXubh76hgT1SGexNob3RL5zoOAegh6GP0YKi5hMA7Y3hwLkAobnRFGVwbQGMCJwTm5+OwUG1AR4fRc2uEdobGeBg2sCOG5wjm6+W0MBdjQMphObGCOB5UebK6wNob0SgAXu4Mohe9jvAiKH5OUSZM6/d0N4IoAye1/loa4wPmqf3KXM3E9oaCkX4plIPoq0xXpT587oObQ0BDdDJyqDZO8hEwTkUehTaGiXKYNkCmDg4lzanEXCQhC5BW2M60Px9QplTWwgIDcjuOEA2UKsDzqnQrmi7tiiDYwtgxcC5tTkW0EB8DQem1PPQ1pguxfz5ajjHrCvRdu1QBsXeIVYUnGObazcblPfggJRCU2MF4HlV5pr1erRdG5TBsHeGFQfneq3nvAj8Mox2mbB/qr5B+mfSoTPPetBfE7f536TzSLvP3TqHt9M1F7hqLFKSVk+2KcKfBp9H25VHGYQuFoEEJ5LFE/hvpP9V6lgvmXnG+W1X9atTVzzg5u11deniK91iP49frJ7BC9vX317+3WXBIhOc8x7mfvxQwJfjAPQwCH/r0hJxX5eftNL2N6DOk9tmCl22J9tKWVTS/hioy6IIfxr8GdquLErwfSyCR7q8pJG2V0MdIm1Di4CRdil9iHGZ664t2c4hUBcjJeYkcO57yoFxQoGeg4H3GHxu0qTaS7tYQtzqFm2ftVidhWyH1fS0ctlGk3de9vsHLMylCH8anIy2K4cS9FgXwYuhTiLtYouAkbZtDirZ/6nl35yYJLwv38afuYHUyR2pMQd6zoXxgAGXQrOuyJ1waX/xYtUC0i5nEaT2A5G+sq3cq+ykLx/kNqVpHAsUgbvZod1KQQGeiQH3HHRu8kn7J0GdRNrFFgEedN+0WJ0M+/IxDiO/rUmNy9PUD2nrvwnmQqmnod3KoATL2kC7DsmZ9DNcur20iy0Cvhoutc0Q/+mqvk3a/Ihr5tcrNP/XKjkxmv51ShE4EEK7jkmd9OPcou0Ji9UVpG1oETzULdr9x2J1Mux7t1LmdR/UhZA+rNGAOTFAXiwHCuwDGOgAwcpJ97sTEnz3Z71twUJH2muL4FK3aPOvi9XJ/IHTE7bJAS7GORowJ0pdiHaTRwmS9TW06xic+JjuKX1SkH78Ky4/EMT/mit1m3doiG9HQ27njVCngX0bDUXgeXNoN3kwwFJo1jUpk47JEbP1SFs+/+g9pHdD+Us3rZvBj0rldkK/5n7LNe9ziv1gcB4ouTGqPraGAnoxBjhQkDmTjknyqwu1i0g7uTv0KqhrQ0obcluPgToE4xsVmBul6mKaDkpwLN596JvcSU9NFGmDxwSpbdSB7aQoRo7t4BSBZ6Kh3WTBwEqlnsLchtxJ/3W36PNri9WbSBtcBIysvwbqUvC+59TobGFbF+P1Lt12cCgfnqLkyOj62RgMbMDgmky69Pkm1HmkjbYI8Nub3GsL2OfjWBhAbud1UIdI25+CuqWDOTJgnvQLBXIwBjZgcHLSU5E+oQs9pI22CJhPu2bbP9Dl2b/MpW9H2tXZxtgLC7oAc6RUL9saFApipxLYUM8Yzp3wZ7pFn9B9caRNaBEwTZKO7b6NhTXIbRwFdYi05RPympAaSxZKnrBuRLvJoQTFej7a9cDDXbMETPGRNn8EdYi0rUtu/ytzLnilXAz8PSOXJj5JUF68TsmV3rY3GBjQgEE9x+VNtrSts5d2fE1xjJ9xi/b7LNQukrJtDTwG4TeAGDmxSnJssylW9fcCDGjAoHCiQ7stfF4O2taRa8/XEUj7v1isnsEXqqS2h+zt8vvEv5Cn+viLg3oHc2XAfOmHJazsW1z1aq4cFS4Mt32nq/p48SnObBMC7b2+opR51d2M+CpX9ZFKeaYD+mi6a9O6ZzBXes6X/qEATsSAJh/UavMQEh+v8bUUS3m0EuZKqYPQbjJQ5z+lBDTUN0PGBFHyhfUutJsMnPBKQJ9EO8PwUH7coeTM19FuMijBsPhbG8NQofw4V8mZ6e5CYyClfgTtDMND+fE4JWdWaxGgjWFIKEd2wZyZdN5gIJMOxhgMzJlJ5w0GMulgjMHAnJl03mAgkw7GGAzMmUnnDQaSEcxnFfH9dyR/IupCCoF23hbLWD+vlLG0+3iijVYWkr+WmK8jwDo+pYLvPHFsaVOH/LXX3z2Dr0n2fM5Vt8FieJyxPCQGy2SdBOv5hzkVzJmMvBkfGEhmMHwas5/IGFwvJ9iXseruZqG1/aduXo6Xf55alms+krc73Sbmy+U/qpSx/Al38vyg0D1N+Ya/XC+fH/DmskzbtlbuY+ftPqKUt/Ov/cmJHmkTO/WE67+HhQjmTGbejAsMpEEw2iQh/+70OzJ435OwQqC17ZONnzaD+DZjD6n4EOn3sdDVx4L9DNn78sOxws3LT8FCt3VaOaJtA18zmh1zmPif54FtYmcEaG1UwJxpkDfjAQNpEExo8CU8+Nrli9435q/V+YR5A1a4+W1UuC52YprWJlPXFzzLNWR/kQvXcRl+onhC9liOrxnNjsH7tYbsGC7X3qwqYM40yJvxgIE0CCY2qJ7YIpA3xNXQymOLgIm1xyd6fRULS2J+GiH7c124LlTOaNcsx+wlqXahXdgXkr4EZSqUI4/AnGmQN+MBAylVd/mfRBtQJLYImPeX/2vtaGV1i8DfZItv4Yho7XlCfQgRsvflB2CF26pj3Qx1GqFtIKl2zL1ubit3i1J9OWe2KTmT7D86MJBSv4V2EVIGv24R+P+1tvA1U7cIGK0tRivzeJ9tQrwLFPLRtuHLdkK5RMbKCu0eMdo2NFLtPNKe/yaflk358VdKzuRse1xQ5+/EYEh88UkqKYOfsgj8axY/sVGWISmLgJMQJ/eJbv4tSQi/ff5q0Ms/V03D20uF7n6B8O1U0FcjVidJtfP4O2awQt9kqQRy5ga0mwzU+Q8qAeUMZsrgpy4Cxrfn7yKh2aQsAgb7prUlQfs60B5fp+B3TUK+oXIk1U7SxCe09zDdJ95T5w9QAsoZmJSB5MsTtVujhPxkm5pNk0XA2697TkBKLBLNXitLwfvht1qp7aXaSfx11VlgrpSa9r2HlIByBiZl8EP1ofLfdVvtajapi+B5Lt4OkmIn9981e3kHDY1jsUCg+WllGql2ks4WAdpMDgwoM6iUwQ/Vh8oZeacFJHURML4NrR2kzi71O3dfHvqxLITWnlamkWonsUXgwYBKoVkMHgTet9XgOn5n16gbvNDEPtrNy/lHqTq+7Oa2P40VCqHtebAuZh+q4zLtl+4nu7C9Vo6k2kmyfSgvdlVyJauNUYIBlcpaBW5rQFn+HYalHQu8xm3V/1f5OgQOMO4q8W8Mxy1YVME2kFe7xTZDelNpf6abn18j67QYZP1byrJPuK27T/MxCj8px9tI+Gtqvm63bhtyLFnctmYn4fovuvq2K1BefEHJFez79Cj0O05MPzCjczBHSr0X7SYHBfEwJTBbBEYFzJFS2qf99FACs0VgVMAcWak8wcBKPRftjPWF8uHVSo6s1CL4Jga3UgEarcHcKMVfbKwGFMxDlABtERibYG6UWo3jAY8SICt2hVY2ot2rSMlnLhpxivndxc+Tc4c2baD2DlRyo9NtjAIMsI9AsW2hC4u8H+jWGh4r0tHKOA46b2g3eSiox2OQXQeKbUd0MvquOzQmexb6DZRVoX8bsO1S0z5pLoQS6BCDWSftHJy1oJi/42vn79cK22pK2Yfe2h8dGGgpfvpLJyht5wqbXDk4RtLnlNizhO02hdq6D9vusv3RUfR8AITtttCJ2PbUKQI3um0qbL8p2G6p4I25VgIlYNbxaNcGau8UZRtNxO+Y2PykoP4/XYkrV3cXPYwDtXmasq3OFthowYD7Dpwnj3QJbq+BsOlRQ/39ihJDqm4pBohX2e5MaLdyFIFzxkl8MUvv0HauULadI2xyVFD/rlT6nKIHh4yNtnWU0gdWp78djRYl8JnQrk94wkk3YB8SFbvV4FKgPu2t9DNF2kU4vaP0Yya0W1ko2Gdj8KXQdBBou4cqfUkR3ztoqfCYKf1KETY1GEXgNBrS0Wi70igDMBPaDQ314RjsU4Jy7qrXCUWz5P8YtrMMlH7NhHYrDwX9JByEUk9B22VA/dhD6VtU2EZfFIH7dUZ0IbaxLKgvZyj9Yx2MtmuBMhAzod0yKfLfcWO3PWyNsr2Y/hH9l43Sx5nQbm0oAo/rJB2BtsumCH+bERI20QpqbzdlGzFhE0uH+nSC0k/Wej/WVxmQmdBuLFDf3oF9jQjdG1HAacw1QvfRoPR1JrRbO2gQDsZBaTE4V5L2wMI+KAY447LI2xXjm/AOwWtd9RYutSj99RpkvkaPMjBNB4gnR+oap9+bqBOK8A9/mtA9CtmfpLShqe/fLM531XHNWgTUx/2Vfs+EtmtLEXnHQ9sacKJQOc9GSKaYn1tT6bsi7YmXFYr005v7uHqOT17DcdOUjNLvmdBu7Snml0RWBoqEd1KOgRMVk/ZwvcZQP/dS+q7pRvSVKPaq0K8lfE0Fjk+dksB+C30QbQ0XHbD90TYATlSqrmPnLlD6HhL6pfomPfwuAf5UxHHIUS3U1x9T+j8T2holRSQR0DYATlQT8bOAW0H9PQf7H9DsZDH6e6xSVxFupyEYb1NFKdrP5fpCg/RyHLSMweMDaf8opbb6iGtBLAlAT1PKUDm7hBr8KCmMr4muIj3UJaDE4GXXd6egDJxX1vOviEtddSKbqBFF+kKI6a3YbgYXu2osOap7+o6KEsOm0NYIUMST551on8hLXHWSc8QP9miEEkOqkt51FV7hqv1PFd+yvTHU58uVOLzQ3IjBA6YMohc/S7gtvIuBCZCqbKjPL1LiCAr9E/mkq/Y1RX/Izm2hfn8c4xBCcyMFGrizlMFkdfnr6OmumhQpyj5mKBLP/0G/BPj3AuxfinJ/jIxShH9F/zm0NTKgAfwODGiXCwC5y1UTpU6HzDwTof7vUJJEKvcsVOxPnRrt56dSVG+hchPaGA0QA/oErOsJ3t3C5KlTEkV3i+AsV+1DTG2/YUqmEAsB64yGFPPjg6EWgCT3q8Xayy07WgS43Zj4K+PBKRcCFhsTB5MrpiAtFwEfh+C2Qvpu6WMYnVK4arKFdGvps0BRf1E/uniw/ZiMdWXjvZftS8LiPvi0qyZeSG3hU8GxzZB6v30hjy8p6WxYYwnQ5PwA9OM9LwpMwpCO9A6ZbHfVtjT19o1PmfRfxLFFO2Mk4EQpelUPi+IkV03KkHJA35A6hcZnN2XcKkI/YyTgRNXojRvdLghMzpBSQB9Np21at4TG4VBlfKLCNoyRgBOVocdiWw25zVWTVdO+3gH4BVe11dSajfluDo5DsrA9YyTgRDXQgxvtPx32c9Wk1XSRdyjhb5PQBvXApnUDODbSdiXubGHbxkigybkEJ6uF2t4RDRNYk39KD5Zrenppm83GPPl5gWOMTfR3pD6ubTa6ZmM+8e9TJrGJsPlUbnHVZG6iRlC/36nEkqMHNubjiE0bU6OcyNOVSc7R3RvNkoGvpMKkzlE21M+XKf1P1W0bzeI0pgJPMOkCZfJT9WVsMxFM7jrdPHdLh/r2aKW/qcLmjHWAJ550r5IQKco6hboEEz2kN3mHFMo4sH8puoh9DWNGmUj3KYlSp4OwrRow4VHP2TKNU/YZ+1On+9nPMKJszL8BweSpEzYTYoerJr5U7CzSTWh7v6n0IaYuvv411g1Kmm1KMsV0ArahsMNVEz95EXAiK9uNiXf3sBnDyIOS6DFKcgWF/sAOV038pEVAbR+B26oRNmEY7aCkulJJtJBCF5fvcNXEr10EG3k/du2F/obRKRt5iwHdmT8n/Y2it0gjhvx3UdoMqel9igwjH05uJQlDeiT6p0B+H1Xa0tTb9QSGUQsl4PVKUmry5wklofiHtB5PgDfGzUbGpwL6aqBPQN9AP8NYOpSY31GSVdM+6MtQ+amKrSZ0NYzxQAm6v5K0mt4BfrcoNqjBbqBlGK3YSN89mt0bSCnX9AzcjmGMHiWRm6qrRzQZxvBQAl+nJHWOsEnDmB6cyEpy1+n/sB3DmDSZC6HNI5oMY9woCY+6Gn0MY6WgJN+hJL6UegKdYawMtgiMtccWgbH22CIwDBc/OEZbwzAMwzAMwzAMwzAMwzD65p/c1j1vroC6seD71wb2Px8Ll8y5rnrfIakxUte3uvrRMtmOrwja2I/5NipafyV19aPkfjfRjq8I2tjvjgUjQuuvpK5+lNQtgseR/EXebHePqNNgW7Y7CysEHyv/+ic+7inqkCNcvH//4uZPc2ebj0Kd58Mu/MR33rZv/17STlEXwn96/gRWNCAWG3INiU+39qdcy/9DfN7Nt8GPj4rxK25u9y2sAOr6W1f/crc1fjF8/R3i/xi+zVOxAvi6m9tdJQvrFgF/NH9fvGbbA8VriWzncvE/IgfhwvL/0APheFJi/eO6u0h8I6qLF6s2YZvQIjjbzev3Ll/z/3V9l/8/S7xuArfx3FIvKF/H8JPI1NliX0MLXNr9DrxGYnVMrF7W7QqvJUe6ed0Tytf8xhrbRcQ4f0m8lsgngHJ7m351i4DfQdjGwyvzpeK1hNv5HhYq4Pb4deiWIttd1V7CdaEE98RsnugW24+NxyvdYh3HGrJNBf2/Cq812KfuCrS/Jt2OhQG4PZ5XL+yTJFbHxOqbbucCeC3h8keJ17y4NPhGxXLb/Iaw2WZs0pmcRcBwW6zzsEKA24v1YbsL1zFcF0pwT8wmZxEwso7/f6143YTYtkIc7+r9+E2lbheI4U/QurYkdbax+lgdIm3/GF5LuPxQLFR4PelnsdBTN+m5i4DxT20ssKIEt8fvWKGHVW93VXsJ14US3BOzyV0Ex7h5/ZdI74e6JoS29UIsEPDuKfuFfBl++B/W/yS89qBdjDrbWH2sDpG2dYvg/6HsRnjN8PFbqI3awcxZBLKda918/1IDt4evJdtdvJ7rQgnuYZvQ/XtyF0Fot60p2rYeiwUCPD7j33pCcP1nxOvni/8lmANanzyxOiZWj9u5W/yPSLvYIjjOzev8MeUvijqE7eTu+mws+cDDd4wPyhDej/L1vDG/Qdb+ws7D5ZxEh5f/h/Bt8L4cH6ActVi9if/Wh3Us1DF8MOnrQ/hPJe2Thg+Gvf820mHiNceq4eulmsCJ7veLNWn8j1us87acJBonuvo2PSl2z3Tzej7e0Hibm9e/GysEKdvhbyC5/qmkPcr/WY+XRoJPuS2bM6BOkjMevbP0DjSEb6ar3Q79OiwwjDqmugi0fjd6CIdhcDLJr7WmAn//LD9OtUVhTIgfAtSc+6ANKSkCAAAAAElFTkSuQmCC>