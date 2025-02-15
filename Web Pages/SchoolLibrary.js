function showModal(article) {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('overlay');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    const image = document.getElementById('modal-image');
    const profile = document.getElementById('modal-profile');
    const member = document.getElementById('modal-member');
    const memberType = document.getElementById('modal-member-type');
    const date = document.getElementById('modal-date');
    const time = document.getElementById('modal-time');
    const profileLink = document.getElementById('modal-profile-link'); 

    const articles = {
        elephants: {
            title: 'The last Sumatran elephants need your voice!',
            content: '(Some of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the lastSome of the last)Some of the last Sumatran elephants roam the forest of Sepitun. The habitat loss and deforestation continue to threaten their survival, and urgent measures are needed to protect them. Join us in raising awareness and supporting conservation efforts!',
            image: 'images/elephant.jpg',
            profile:'',
            member: 'user1',
            memberType: 'Member',
            profileLink: 'profileA.html', 
            date: '10 Feb 2025',
            time: '12:42 PM'
        },
        rhinos: {
            title: 'Javan rhinos',
            content: 'The International Union of Nature (IUCN) classified Javan rhinos as critically endangered. Habitat destruction and poaching have caused a drastic decline in their population. With only a few left in the wild, every effort counts to ensure their survival.',
            image: 'images/rhino.jpg',
            profile: '',
            member: 'user2',
            memberType: 'Member',
            profileLink: 'profileB.html',
            date: '10 Feb 2025',
            time: '12:42 PM'
        },
        tigers: {
            title: 'Endangered Tigers',
            content: 'Tigers are facing habitat destruction and poaching. With fewer than 4,000 tigers left in the wild, urgent action is needed to prevent their extinction. We must protect their habitats and end illegal poaching activities to safeguard the future of these majestic creatures.',
            image: 'images/tiger.jpg',
            profile: '',
            member: 'user3',
            memberType: 'Member',
            profileLink: 'profileC.html',
            date: '10 Feb 2025',
            time: '12:42 PM'
        }
    };

    title.innerText = articles[article].title;
    content.innerText = articles[article].content;
    image.src = articles[article].image;
    profile.src = articles[article].profile || 'images/default.png'; 
    member.innerText = articles[article].member;
    memberType.innerText = articles[article].memberType;
    date.innerText = articles[article].date;
    time.innerText = articles[article].time;
    profileLink.href = articles[article].profileLink; 

    modal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('overlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';
}
